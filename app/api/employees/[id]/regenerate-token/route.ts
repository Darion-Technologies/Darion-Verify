import { NextResponse } from "next/server";
import { generateVerificationToken } from "@/lib/employee";
import { requireApiUser } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const { id } = await context.params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees")
    .update({ verification_token: generateVerificationToken() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employee: data });
}
