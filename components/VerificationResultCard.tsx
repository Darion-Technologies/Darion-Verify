import Image from "next/image";
import { ShieldCheck, ShieldX } from "lucide-react";
import { DarionLogo } from "@/components/DarionLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeStatusBadge } from "@/components/EmployeeStatusBadge";
import type { PublicEmployee } from "@/lib/types";

export function VerificationResultCard({
  employee,
  result
}: {
  employee: PublicEmployee | null;
  result: string;
}) {
  const verified = result === "Verified Employee";

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <DarionLogo className="h-11 w-11" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Darion Technologies</p>
            <CardTitle>Employee Verification</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!employee ? (
          <div className="flex flex-col items-center py-10 text-center">
            <ShieldX className="h-12 w-12 text-red-600" />
            <h1 className="mt-4 text-2xl font-semibold">{result}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This verification token does not match an employee record.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="relative h-32 w-28 shrink-0 overflow-hidden border bg-neutral-100">
                {employee.photo_url ? (
                  <Image src={employee.photo_url} alt={employee.full_name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                    Employee Photo
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="break-words text-2xl font-semibold">{employee.full_name}</h1>
                    <p className="text-muted-foreground">{employee.role}</p>
                  </div>
                  <EmployeeStatusBadge status={employee.status} />
                </div>
                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Employee ID" value={employee.employee_id} />
                  <Info label="Department" value={employee.department} />
                  <Info label="Employment Type" value={employee.employment_type || "Not specified"} />
                  <Info label="Joining Date" value={employee.joining_date || "Not specified"} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t pt-5">
              {verified ? (
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              ) : (
                <ShieldX className="h-6 w-6 text-amber-600" />
              )}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Verification Result</p>
                <p className="text-lg font-semibold">{result}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="break-words font-medium">{value}</p>
    </div>
  );
}
