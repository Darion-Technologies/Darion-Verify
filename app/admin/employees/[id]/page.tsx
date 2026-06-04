import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthenticatorSetupCard } from "@/components/AuthenticatorSetupCard";
import { EmployeeForm } from "@/components/EmployeeForm";
import { EmployeeProfileCard } from "@/components/EmployeeProfileCard";
import { TokenActions } from "@/components/TokenActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { Employee, EmployeeActivityLog, VerificationLog } from "@/lib/types";

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

  const { data: activityLogs } = await supabase
    .from("employee_activity_logs")
    .select("*")
    .eq("employee_id", id)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link
          href="/admin/employees"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to employees
        </Link>
        <h1 className="text-2xl font-semibold">Employee profile</h1>
        <p className="text-sm text-muted-foreground">
          Review, update, manage QR access, and inspect employee verification records.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <EmployeeProfileCard employee={employee as Employee} />
          <Card className="bg-white">
            <CardHeader className="border-b">
              <CardTitle>Employee Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ActivityLogs logs={(activityLogs || []) as EmployeeActivityLog[]} />
            </CardContent>
          </Card>
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
              <CardTitle>QR verification key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="break-all border bg-muted p-3 text-xs text-muted-foreground">
                {(employee as Employee).verification_token}
              </p>
              <TokenActions employeeId={id} />
            </CardContent>
          </Card>
          <AuthenticatorSetupCard employee={employee as Employee} />
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

function ActivityLogs({ logs }: { logs: EmployeeActivityLog[] }) {
  if (!logs.length) {
    return <p className="text-sm text-muted-foreground">No employee activity recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="border p-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <p className="font-medium">{log.action}</p>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
          {log.details ? <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{log.details}</p> : null}
        </div>
      ))}
    </div>
  );
}
