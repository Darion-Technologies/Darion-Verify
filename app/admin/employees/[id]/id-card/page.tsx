import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { IDCardActions } from "@/components/IDCardActions";
import { IDCardPreview } from "@/components/IDCardPreview";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/url";
import type { Employee } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IDCardPage({ params }: PageProps) {
  const { id } = await params;
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: employee, error } = await supabase.from("employees").select("*").eq("id", id).single();

  if (error || !employee) {
    notFound();
  }

  const typedEmployee = employee as Employee;
  const origin = await getRequestOrigin();
  const verificationUrl = `${origin}/verify/${typedEmployee.verification_token}`;

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href={`/admin/employees/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">ID card preview</h1>
          <p className="text-sm text-muted-foreground">Download a PNG or use print to save as PDF.</p>
        </div>
        <IDCardActions
          fileName={typedEmployee.employee_id}
          verificationUrl={verificationUrl}
          employeeName={typedEmployee.full_name}
        />
      </div>
      <div className="flex justify-center">
        <IDCardPreview employee={typedEmployee} verificationUrl={verificationUrl} />
      </div>
    </AdminLayout>
  );
}
