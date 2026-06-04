"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeBox } from "@/components/QRCodeBox";
import type { Employee } from "@/lib/types";

export function AuthenticatorSetupCard({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setupUri = employee.complete_verification_secret
    ? getAuthenticatorUri(employee.complete_verification_secret, employee.employee_id, employee.full_name)
    : "";

  async function resetSecret() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/employees/${employee.id}/authenticator-secret`, {
      method: "POST"
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Unable to reset authenticator setup.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="bg-white">
      <CardHeader className="border-b">
        <CardTitle>Complete Verification Authenticator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Scan this QR in an authenticator app. The current 6-digit code unlocks Complete Verification for this employee.
        </p>
        {employee.complete_verification_secret ? (
          <div className="space-y-4">
            <QRCodeBox value={setupUri} size={160} />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Manual setup key</p>
              <p className="mt-1 break-all border bg-muted p-3 font-mono text-xs">
                {employee.complete_verification_secret}
              </p>
            </div>
          </div>
        ) : (
          <div className="border bg-neutral-50 p-4 text-sm text-muted-foreground">
            No authenticator secret exists for this employee yet.
          </div>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button variant="outline" onClick={resetSecret} disabled={loading}>
          <RotateCcw className="h-4 w-4" />
          {loading ? "Resetting..." : "Reset authenticator setup"}
        </Button>
      </CardContent>
    </Card>
  );
}

function getAuthenticatorUri(secret: string, employeeId: string, employeeName: string) {
  const issuer = "Darion Badge";
  const label = `${issuer}:${employeeId} ${employeeName}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30"
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}
