import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server";

const logSchema = z.object({
  employee_id: z.string().uuid().nullable().optional(),
  result: z.string().min(1),
  ip_address: z.string().nullable().optional(),
  device_info: z.string().nullable().optional()
});

export async function GET() {
  const { response } = await requireApiUser();
  if (response) {
    return response;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("verification_logs")
    .select("*")
    .order("scanned_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data });
}

export async function POST(request: Request) {
  const parsed = logSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid log payload." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("verification_logs")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data }, { status: 201 });
}
