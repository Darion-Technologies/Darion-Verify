import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getVerificationResult } from "@/lib/employee";
import { createAdminClient } from "@/lib/supabase/server";
import type { PublicEmployee } from "@/lib/types";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const supabase = createAdminClient();
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    null;
  const deviceInfo = headerStore.get("user-agent");

  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, employee_id, role, department, employment_type, joining_date, status, photo_url")
    .eq("verification_token", token)
    .maybeSingle();

  if (error || !data) {
    await supabase.from("verification_logs").insert({
      employee_id: null,
      result: "Invalid verification link",
      ip_address: ip,
      device_info: deviceInfo
    });
    return NextResponse.json({ employee: null, result: "Invalid verification link" }, { status: 404 });
  }

  const result = getVerificationResult(data.status);
  await supabase.from("verification_logs").insert({
    employee_id: data.id,
    result,
    ip_address: ip,
    device_info: deviceInfo
  });

  const publicEmployee: PublicEmployee = {
    full_name: data.full_name,
    employee_id: data.employee_id,
    role: data.role,
    department: data.department,
    employment_type: data.employment_type,
    joining_date: data.joining_date,
    status: data.status,
    photo_url: data.photo_url
  };

  return NextResponse.json({ employee: publicEmployee, result });
}
