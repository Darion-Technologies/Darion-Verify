import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { EmployeeTable } from "@/components/EmployeeTable";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { Employee } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage employee IDs, statuses, QR codes, and scan records.</p>
        </div>
        <Button asChild>
          <Link href="/admin/employees/new">
            <Plus className="h-4 w-4" />
            Add employee
          </Link>
        </Button>
      </div>
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>
      ) : (
        <EmployeeTable employees={(data || []) as Employee[]} />
      )}
    </AdminLayout>
  );
}
