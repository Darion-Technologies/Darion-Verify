import { NextResponse } from "next/server";
import { employeeSchema, generateEmployeeId, generateVerificationToken } from "@/lib/employee";
import { requireApiUser } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";
import { generateTotpSecret } from "@/lib/totp";

export async function GET() {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employees: data });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (response) {
    return response;
  }

  const parsed = employeeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid form data." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { admin_note: adminNote, ...employeeValues } = parsed.data;
  const { count, error: countError } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const employee = {
    ...employeeValues,
    employment_type: employeeValues.employment_type || null,
    joining_date: employeeValues.joining_date || null,
    photo_url: employeeValues.photo_url || null,
    employee_id: generateEmployeeId(employeeValues.department, (count || 0) + 1),
    verification_token: generateVerificationToken(),
    complete_verification_secret: generateTotpSecret()
  };

  const { data, error } = await supabase.from("employees").insert(employee).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("employee_activity_logs").insert({
    employee_id: data.id,
    action: "Employee created",
    details: adminNote || "Employee record created by admin.",
    actor_id: user?.id || null
  });

  return NextResponse.json({ employee: data }, { status: 201 });
}
