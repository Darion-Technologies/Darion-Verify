import { headers } from "next/headers";
import { VerificationResultCard } from "@/components/VerificationResultCard";
import { getVerificationResult } from "@/lib/employee";
import { createAdminClient } from "@/lib/supabase/server";
import type { PublicEmployee } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function VerifyPage({ params }: PageProps) {
  const { token } = await params;
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    null;
  const deviceInfo = headerStore.get("user-agent");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("employees")
    .select("id, full_name, employee_id, role, department, employment_type, joining_date, status, photo_url")
    .eq("verification_token", token)
    .maybeSingle();

  const result = data ? getVerificationResult(data.status) : "Invalid verification link";

  await supabase.from("verification_logs").insert({
    employee_id: data?.id || null,
    result,
    ip_address: ip,
    device_info: deviceInfo
  });

  const employee: PublicEmployee | null = data
    ? {
        full_name: data.full_name,
        employee_id: data.employee_id,
        role: data.role,
        department: data.department,
        employment_type: data.employment_type,
        joining_date: data.joining_date,
        status: data.status,
        photo_url: data.photo_url
      }
    : null;

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <VerificationResultCard employee={employee} result={result} token={token} />
    </main>
  );
}
