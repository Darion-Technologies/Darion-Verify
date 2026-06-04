"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompleteVerificationEmployee, EmployeeActivityLog } from "@/lib/types";

type CompleteVerificationResponse = {
  employee: CompleteVerificationEmployee;
  logs: EmployeeActivityLog[];
};

export function CompleteVerificationPanel({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completeLog, setCompleteLog] = useState<CompleteVerificationResponse | null>(null);

  async function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/verify/${token}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setCompleteLog(null);
      setError("Invalid authenticator code.");
      setLoading(false);
      return;
    }

    setCompleteLog(payload as CompleteVerificationResponse);
    setCode("");
    setLoading(false);
  }

  return (
    <div className="mt-6 border-t pt-5">
      {!open ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Need authorized access?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use an authenticator code to view the employee activity record.
            </p>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Authorized Verification
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <form onSubmit={submitCode} className="border bg-neutral-50 p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Authorized Verification</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the authenticator code to access the employee activity record.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Authenticator code</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="password"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Checking..." : "Access"}
                </Button>
              </div>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Enter the current code from the employee authenticator app.
            </p>
          </form>
          {completeLog ? <CompleteEmployeeLog data={completeLog} /> : null}
        </div>
      )}
    </div>
  );
}

function CompleteEmployeeLog({ data }: { data: CompleteVerificationResponse }) {
  const employee = data.employee;

  return (
    <section className="border bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Employee Activity Record</h2>
        <p className="text-sm text-muted-foreground">Authorized employee update history.</p>
      </div>
      <div className="grid gap-4 p-4 text-sm sm:grid-cols-2">
        <Info label="Full Name" value={employee.full_name} />
        <Info label="Employee ID" value={employee.employee_id} />
        <Info label="Role" value={employee.role} />
        <Info label="Department" value={employee.department} />
        <Info label="Employment Type" value={employee.employment_type || "Not specified"} />
        <Info label="Joining Date" value={employee.joining_date || "Not specified"} />
        <Info label="Status" value={employee.status} />
        <Info label="Created Date" value={formatDateTime(employee.created_at)} />
        <Info label="Updated Date" value={formatDateTime(employee.updated_at)} />
      </div>
      <div className="border-t p-4">
        <h3 className="font-semibold">Employee Update History</h3>
        {data.logs.length ? (
          <div className="mt-3 space-y-3">
            {data.logs.map((log) => (
              <div key={log.id} className="border p-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                </div>
                {log.details ? <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{log.details}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No employee updates recorded yet.</p>
        )}
      </div>
    </section>
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
