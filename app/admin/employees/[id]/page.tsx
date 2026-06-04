import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { EmployeeForm } from "@/components/EmployeeForm";
import { EmployeeProfileCard } from "@/components/EmployeeProfileCard";
import { TokenActions } from "@/components/TokenActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { Employee, VerificationLog } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: employee, error } = await supabase.from("employees").select("*").eq("id", id).single();

  if (error || !employee) {
    notFound();
  }

  const { data: logs } = await supabase
    .from("verification_logs")
    .select("*")
    .eq("employee_id", id)
    .order("scanned_at", { ascending: false })
    .limit(25);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Employee profile</h1>
        <p className="text-sm text-muted-foreground">Review, update, regenerate token, and inspect verification scans.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <EmployeeProfileCard employee={employee as Employee} />
          <Card className="bg-white">
            <CardHeader className="border-b">
              <CardTitle>Edit employee</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <EmployeeForm employee={employee as Employee} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="border-b">
              <CardTitle>Verification token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="break-all border bg-muted p-3 text-xs text-muted-foreground">
                {(employee as Employee).verification_token}
              </p>
              <TokenActions employeeId={id} />
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="border-b">
              <CardTitle>Recent scan logs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ScanLogs logs={(logs || []) as VerificationLog[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function ScanLogs({ logs }: { logs: VerificationLog[] }) {
  if (!logs.length) {
    return <p className="text-sm text-muted-foreground">No verification scans recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="border p-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{log.result}</p>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              {new Date(log.scanned_at).toLocaleString()}
            </p>
          </div>
          <p className="mt-1 break-all text-xs text-muted-foreground">{log.device_info || "Unknown device"}</p>
          <p className="mt-1 text-xs text-muted-foreground">IP: {log.ip_address || "Not available"}</p>
        </div>
      ))}
    </div>
  );
}
