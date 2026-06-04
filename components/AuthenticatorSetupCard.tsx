"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeBox } from "@/components/QRCodeBox";
import { Textarea } from "@/components/ui/textarea";
import type { Employee } from "@/lib/types";

export function AuthenticatorSetupCard({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  const setupUri = employee.complete_verification_secret
    ? getAuthenticatorUri(employee.complete_verification_secret, employee.employee_id, employee.full_name)
    : "";

  async function shareSetupDetails() {
    if (!employee.complete_verification_secret) {
      setError("No authenticator setup exists for this employee.");
      return;
    }

    setError("");
    setMessage("");

    const shareText = [
      `Darion Badge authenticator setup for ${employee.full_name}`,
      `Employee ID: ${employee.employee_id}`,
      `Manual setup key: ${employee.complete_verification_secret}`,
      `Setup URI: ${setupUri}`,
      "Share only with authorized people."
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${employee.full_name} authenticator setup`,
          text: shareText
        });
        setMessage("Authenticator setup details shared.");
        return;
      }

      await copyText(shareText);
      setMessage("Authenticator setup details copied.");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return;
      }
      setError("Unable to share authenticator setup details.");
    }
  }

  async function resetSecret() {
    if (!note.trim()) {
      setError("Add an admin note before resetting authenticator setup.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    const response = await fetch(`/api/employees/${employee.id}/authenticator-secret`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_note: note })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Unable to reset authenticator setup.");
      setLoading(false);
      return;
    }

    setNote("");
    setMessage("Authenticator setup reset.");
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="bg-white">
      <CardHeader className="border-b">
        <CardTitle>Authorized Verification Authenticator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Scan this QR in an authenticator app. The current 6-digit code unlocks Authorized Verification for this employee.
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
            <div className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Authenticator setup details are sensitive. Share them only with the employee or an authorized admin.
            </div>
          </div>
        ) : (
          <div className="border bg-neutral-50 p-4 text-sm text-muted-foreground">
            No authenticator secret exists for this employee yet.
          </div>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Required note for authenticator reset"
        />
        <div className="grid gap-3">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={shareSetupDetails}
            disabled={!employee.complete_verification_secret}
          >
            <Share2 className="h-4 w-4" />
            Share setup details
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={resetSecret} disabled={loading}>
            <RotateCcw className="h-4 w-4" />
            {loading ? "Resetting..." : "Reset authenticator setup"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
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
