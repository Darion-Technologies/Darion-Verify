import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api";
import { getProductionApiError } from "@/lib/api-errors";
import { createAdminClient } from "@/lib/supabase/server";
import { generateTotpSecret } from "@/lib/totp";

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
    .update({ complete_verification_secret: generateTotpSecret() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: getProductionApiError(error.message) }, { status: 500 });
  }

  await supabase.from("employee_activity_logs").insert({
    employee_id: id,
    action: "Authenticator reset",
    details: `Admin note: ${parsed.data.admin_note}`,
    actor_id: user?.id || null
  });

  return NextResponse.json({ employee: data });
}
