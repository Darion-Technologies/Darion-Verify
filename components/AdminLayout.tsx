import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarionLogo } from "@/components/DarionLogo";
import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin/employees" className="flex items-center gap-3">
            <DarionLogo className="h-10 w-10" />
            <div>
              <p className="text-base font-semibold">Darion Verify</p>
              <p className="text-xs text-muted-foreground">Darion Technologies</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/employees">
                <Users className="h-4 w-4" />
                Employees
              </Link>
            </Button>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
