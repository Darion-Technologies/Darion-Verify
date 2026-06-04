"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TokenActions({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"token" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  async function regenerateToken() {
    if (!note.trim()) {
      setError("Add an admin note before regenerating the QR verification key.");
      return;
    }

    setLoading("token");
    setError("");
    setMessage("");
    const response = await fetch(`/api/employees/${employeeId}/regenerate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_note: note })
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to regenerate QR verification key.");
      setLoading(null);
      return;
    }
    setNote("");
    setMessage("QR verification key regenerated.");
    setLoading(null);
    router.refresh();
  }

  async function deleteEmployee() {
    if (!note.trim()) {
      setError("Add an admin note before deleting this employee.");
      return;
    }

    if (!confirm("Delete this employee record?")) {
      return;
    }

    setLoading("delete");
    setError("");
    setMessage("");
    const response = await fetch(`/api/employees/${employeeId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_note: note })
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to delete employee.");
      setLoading(null);
      return;
    }
    router.push("/admin/employees");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error ? <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Required note for key regeneration or employee delete"
      />
      <div className="grid gap-3">
        <Button className="w-full justify-start" variant="outline" onClick={regenerateToken} disabled={!!loading}>
          <RotateCcw className="h-4 w-4" />
          {loading === "token" ? "Regenerating..." : "Regenerate QR verification key"}
        </Button>
        <Button className="w-full justify-start" variant="destructive" onClick={deleteEmployee} disabled={!!loading}>
          <Trash2 className="h-4 w-4" />
          {loading === "delete" ? "Deleting..." : "Delete employee"}
        </Button>
      </div>
    </div>
  );
}
