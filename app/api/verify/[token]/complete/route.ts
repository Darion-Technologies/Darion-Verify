import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import type { CompleteVerificationEmployee, VerificationLog } from "@/lib/types";

const completeVerificationSchema = z.object({
  code: z.string().min(1)
});

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const configuredCode = process.env.COMPLETE_VERIFICATION_CODE;
  const parsed = completeVerificationSchema.safeParse(await request.json().catch(() => null));

  if (!configuredCode || !parsed.success || parsed.data.code !== configuredCode) {
    return NextResponse.json({ error: "Invalid internal code." }, { status: 401 });
  }

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
    .select("id, full_name, employee_id, role, department, employment_type, joining_date, status, photo_url, created_at, updated_at")
    .eq("verification_token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Verification record not found." }, { status: 404 });
  }

  await supabase.from("verification_logs").insert({
    employee_id: data.id,
    result: "Complete verification accessed",
    ip_address: ip,
    device_info: deviceInfo
  });

  const { data: logs } = await supabase
    .from("verification_logs")
    .select("id, employee_id, scanned_at, result, ip_address, device_info")
    .eq("employee_id", data.id)
    .order("scanned_at", { ascending: false })
    .limit(25);

  const employee: CompleteVerificationEmployee = {
    full_name: data.full_name,
    employee_id: data.employee_id,
    role: data.role,
    department: data.department,
    employment_type: data.employment_type,
    joining_date: data.joining_date,
    status: data.status,
    photo_url: data.photo_url,
    created_at: data.created_at,
    updated_at: data.updated_at
  };

  return NextResponse.json({
    employee,
    logs: (logs || []) as VerificationLog[]
  });
}
