import Image from "next/image";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeStatusBadge } from "@/components/EmployeeStatusBadge";
import type { Employee } from "@/lib/types";

export function EmployeeProfileCard({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{employee.full_name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{employee.role}</p>
          </div>
          <EmployeeStatusBadge status={employee.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="relative h-36 w-28 overflow-hidden border bg-muted">
            {employee.photo_url ? (
              <Image src={employee.photo_url} alt={employee.full_name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                No photo
              </div>
            )}
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Info label="Employee ID" value={employee.employee_id} />
            <Info label="Department" value={employee.department} />
            <Info label="Employment Type" value={employee.employment_type || "Not specified"} />
            <Info label="Joining Date" value={employee.joining_date || "Not specified"} />
            <Info label="Created" value={new Date(employee.created_at).toLocaleDateString()} />
            <Info label="Updated" value={new Date(employee.updated_at).toLocaleDateString()} />
          </div>
        </div>
        <Button asChild className="mt-6">
          <Link href={`/admin/employees/${employee.id}/id-card`}>
            <QrCode className="h-4 w-4" />
            Preview ID card
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value}</p>
    </div>
  );
}
