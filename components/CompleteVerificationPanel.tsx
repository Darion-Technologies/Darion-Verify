"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompleteVerificationEmployee, VerificationLog } from "@/lib/types";

type CompleteVerificationResponse = {
  employee: CompleteVerificationEmployee;
  logs: VerificationLog[];
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
      setError("Invalid internal code.");
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
        <Button variant="outline" onClick={() => setOpen(true)}>
          Complete Verification
        </Button>
      ) : (
        <div className="space-y-5">
          <form onSubmit={submitCode} className="border bg-neutral-50 p-4">
            <div className="space-y-2">
              <Label>Internal code</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="password"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Enter internal code"
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Checking..." : "Access"}
                </Button>
              </div>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Complete employee logs are restricted to authorized QR verification access.
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
        <h2 className="text-lg font-semibold">Complete Employee Log</h2>
        <p className="text-sm text-muted-foreground">Internal QR verification view.</p>
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
        <Info label="Photo URL" value={employee.photo_url || "Not available"} />
      </div>
      <div className="border-t p-4">
        <h3 className="font-semibold">Verification Scan History</h3>
        {data.logs.length ? (
          <div className="mt-3 space-y-3">
            {data.logs.map((log) => (
              <div key={log.id} className="border p-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-medium">{log.result}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.scanned_at)}</p>
                </div>
                <p className="mt-2 break-all text-xs text-muted-foreground">
                  Device: {log.device_info || "Not available"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">IP: {log.ip_address || "Not available"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No verification scans recorded yet.</p>
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
