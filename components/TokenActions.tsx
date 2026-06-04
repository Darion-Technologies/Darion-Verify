"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TokenActions({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"token" | "delete" | null>(null);
  const [error, setError] = useState("");

  async function regenerateToken() {
    setLoading("token");
    setError("");
    const response = await fetch(`/api/employees/${employeeId}/regenerate-token`, { method: "POST" });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to regenerate token.");
    }
    setLoading(null);
    router.refresh();
  }

  async function deleteEmployee() {
    if (!confirm("Delete this employee record?")) {
      return;
    }

    setLoading("delete");
    setError("");
    const response = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={regenerateToken} disabled={!!loading}>
          <RotateCcw className="h-4 w-4" />
          {loading === "token" ? "Regenerating..." : "Regenerate verification token"}
        </Button>
        <Button variant="destructive" onClick={deleteEmployee} disabled={!!loading}>
          <Trash2 className="h-4 w-4" />
          {loading === "delete" ? "Deleting..." : "Delete employee"}
        </Button>
      </div>
    </div>
  );
}
