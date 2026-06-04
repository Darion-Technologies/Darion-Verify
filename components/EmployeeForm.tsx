"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYEE_STATUSES, type Employee } from "@/lib/types";
import { employeeSchema, type EmployeeFormValues } from "@/lib/employee";
import { uploadEmployeePhoto } from "@/lib/storage";

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: employee?.full_name || "",
      role: employee?.role || "",
      department: employee?.department || "",
      employment_type: employee?.employment_type || "",
      joining_date: employee?.joining_date || "",
      status: employee?.status || "Active",
      photo_url: employee?.photo_url || "",
      admin_note: ""
    }
  });

  async function onSubmit(values: EmployeeFormValues) {
    setError("");
    setMessage("");

    if (employee && values.status !== employee.status && !values.admin_note?.trim()) {
      setError("Add an admin update note before changing employee status.");
      return;
    }

    const response = await fetch(employee ? `/api/employees/${employee.id}` : "/api/employees", {
      method: employee ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Unable to save employee.");
      return;
    }

    if (!employee) {
      router.push(`/admin/employees/${payload.employee.id}`);
      return;
    }

    setMessage("Employee changes saved.");
    router.refresh();
  }

  async function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    try {
      const url = await uploadEmployeePhoto(file, employee?.id || "new");
      setValue("photo_url", url, { shouldValidate: true });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error ? <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      <input type="hidden" {...register("photo_url")} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" error={errors.full_name?.message}>
          <Input {...register("full_name")} placeholder="Aarav Sharma" />
        </Field>
        <Field label="Role" error={errors.role?.message}>
          <Input {...register("role")} placeholder="Full Stack Developer" />
        </Field>
        <Field label="Department" error={errors.department?.message}>
          <Input {...register("department")} placeholder="Full Stack Development" />
        </Field>
        <Field label="Employment type" error={errors.employment_type?.message}>
          <Input {...register("employment_type")} placeholder="Full-time, Intern, Contractor" />
        </Field>
        <Field label="Joining date" error={errors.joining_date?.message}>
          <Input type="date" {...register("joining_date")} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            {EMPLOYEE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Upload photo">
          <Input type="file" accept="image/*" onChange={onPhotoChange} disabled={uploading} />
          {uploading ? <p className="mt-2 text-xs text-muted-foreground">Uploading photo...</p> : null}
        </Field>
      </div>
      <Field label="Admin update note" error={errors.admin_note?.message}>
        <Textarea
          {...register("admin_note")}
          placeholder="Promotion, remark, warning, bad mark, document check, or any internal update note"
        />
      </Field>
      {watch("photo_url") ? <p className="text-xs text-muted-foreground">Employee photo is attached.</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {employee ? "Save changes" : "Create employee"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
