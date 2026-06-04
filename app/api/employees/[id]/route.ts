import { NextResponse } from "next/server";
import { z } from "zod";
import { employeeSchema } from "@/lib/employee";
import { getProductionApiError } from "@/lib/api-errors";
import { requireApiUser } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import type { Employee } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const deleteSchema = z.object({
  admin_note: z.string().trim().min(1, "Admin note is required.").max(800)
});

export async function GET(_request: Request, context: RouteContext) {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: getProductionApiError(error.message) }, { status: 404 });
  }

  return NextResponse.json({ employee: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { user, response } = await requireApiUser();
  if (response) {
    return response;
  }

  const parsed = employeeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid form data." }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("employees").select("*").eq("id", id).single();
  const { admin_note: adminNote, ...employeeValues } = parsed.data;
  if ((existing as Employee | null)?.status !== employeeValues.status && !adminNote?.trim()) {
    return NextResponse.json({ error: "Admin note is required when changing employee status." }, { status: 400 });
  }

  const payload = {
    ...employeeValues,
    employment_type: employeeValues.employment_type || null,
    joining_date: employeeValues.joining_date || null,
    photo_url: employeeValues.photo_url || null
  };

  const { data, error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: getProductionApiError(error.message) }, { status: 500 });
  }

  const details = buildEmployeeUpdateDetails(existing as Employee | null, data as Employee, adminNote);
  if (details) {
    await supabase.from("employee_activity_logs").insert({
      employee_id: data.id,
      action: "Employee updated",
      details,
      actor_id: user?.id || null
    });
  }

  return NextResponse.json({ employee: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { user, response } = await requireApiUser();
  if (response) {
    return response;
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const parsed = deleteSchema.safeParse(await _request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Admin note is required." }, { status: 400 });
  }

  await supabase.from("employee_activity_logs").insert({
    employee_id: id,
    action: "Employee deleted",
    details: `Admin note: ${parsed.data.admin_note}`,
    actor_id: user?.id || null
  });
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: getProductionApiError(error.message) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function buildEmployeeUpdateDetails(existing: Employee | null, updated: Employee, adminNote?: string) {
  const changes: string[] = [];
  const fields: Array<[keyof Employee, string]> = [
    ["full_name", "Full name"],
    ["role", "Role"],
    ["department", "Department"],
    ["employment_type", "Employment type"],
    ["joining_date", "Joining date"],
    ["status", "Status"],
    ["photo_url", "Photo"]
  ];

  if (existing) {
    for (const [field, label] of fields) {
      const before = existing[field] || "Not specified";
      const after = updated[field] || "Not specified";
      if (before !== after) {
        if (field === "photo_url") {
          changes.push("Photo: updated");
          continue;
        }
        changes.push(`${label}: ${before} -> ${after}`);
      }
    }
  }

  if (adminNote) {
    changes.push(`Admin note: ${adminNote}`);
  }

  return changes.join("\n");
}
