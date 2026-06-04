import { AdminLayout } from "@/components/AdminLayout";

export default function LoadingEmployees() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse bg-neutral-200" />
        <div className="h-10 max-w-md animate-pulse bg-neutral-200" />
        <div className="h-64 animate-pulse border bg-white" />
      </div>
    </AdminLayout>
  );
}
