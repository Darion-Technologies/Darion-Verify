import { NextResponse } from "next/server";
import { employeeSchema } from "@/lib/employee";
import { requireApiUser } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ employee: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const parsed = employeeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid form data." }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const payload = {
    ...parsed.data,
    employment_type: parsed.data.employment_type || null,
    joining_date: parsed.data.joining_date || null,
    photo_url: parsed.data.photo_url || null
  };

  const { data, error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employee: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
