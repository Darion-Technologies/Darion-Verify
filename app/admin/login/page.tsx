"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DarionLogo } from "@/components/DarionLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/employees");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="border-b">
          <DarionLogo className="mb-4 h-14 w-14" />
          <CardTitle>Darion Badge Admin</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to manage QR verification records.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={login} className="space-y-4">
            {error ? <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
