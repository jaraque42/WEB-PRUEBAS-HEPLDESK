"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Iniciar sesion</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="h-11"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Contrasena</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 mt-2">
            {loading ? (
              "Entrando..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No tienes cuenta?{" "}
            <Link className="text-primary font-medium hover:underline" href="/auth/register">
              Registrate
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
