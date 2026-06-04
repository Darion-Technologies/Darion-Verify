import { createClient } from "@/lib/supabase/client";

export async function uploadEmployeePhoto(file: File, employeeId: string) {
  const supabase = createClient();
  const bucket = process.env.NEXT_PUBLIC_EMPLOYEE_PHOTOS_BUCKET || "employee-photos";
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${employeeId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
