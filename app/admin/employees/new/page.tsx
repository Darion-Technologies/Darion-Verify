import { AdminLayout } from "@/components/AdminLayout";
import { EmployeeForm } from "@/components/EmployeeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewEmployeePage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add employee</h1>
        <p className="text-sm text-muted-foreground">Employee ID and verification token are generated automatically.</p>
      </div>
      <Card className="bg-white">
        <CardHeader className="border-b">
          <CardTitle>Employee details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <EmployeeForm />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
