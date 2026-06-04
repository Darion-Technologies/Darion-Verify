import { NextResponse } from "next/server";
import { z } from "zod";
import { generateVerificationToken } from "@/lib/employee";
import { getProductionApiError } from "@/lib/api-errors";
import { requireApiUser } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

const sensitiveActionSchema = z.object({
  admin_note: z.string().trim().min(1, "Admin note is required.").max(800)
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { user, response } = await requireApiUser();
  if (response) {
    return response;
  }

  const parsed = sensitiveActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Admin note is required." }, { status: 400 });
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
    return NextResponse.json({ error: getProductionApiError(error.message) }, { status: 500 });
  }

  await supabase.from("employee_activity_logs").insert({
    employee_id: id,
    action: "QR verification key regenerated",
    details: `Admin note: ${parsed.data.admin_note}`,
    actor_id: user?.id || null
  });

  return NextResponse.json({ employee: data });
}
