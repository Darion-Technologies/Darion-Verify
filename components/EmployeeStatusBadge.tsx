import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmployeeStatus } from "@/lib/types";

const statusClasses: Record<EmployeeStatus, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Intern: "border-sky-200 bg-sky-50 text-sky-700",
  Probation: "border-amber-200 bg-amber-50 text-amber-700",
  Suspended: "border-red-200 bg-red-50 text-red-700",
  Exited: "border-neutral-300 bg-neutral-100 text-neutral-700",
  "Expired ID": "border-orange-200 bg-orange-50 text-orange-700",
  "Under Review": "border-violet-200 bg-violet-50 text-violet-700"
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge className={cn("whitespace-nowrap", statusClasses[status])}>{status}</Badge>;
}
