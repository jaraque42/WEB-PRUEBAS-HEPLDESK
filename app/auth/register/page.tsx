"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      toast.success("Cuenta creada.");
      if (data.session) {
        router.push("/dashboard");
      } else {
        toast.message("Revisa tu email si Supabase requiere confirmacion.");
        router.push("/auth/login");
      }
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
        <p className="text-sm text-muted-foreground">
          Registrate para empezar a crear tickets
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nombre completo</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              className="h-11"
              required
            />
          </div>
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
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 mt-2">
            {loading ? (
              "Creando..."
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear cuenta
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link className="text-primary font-medium hover:underline" href="/auth/login">
              Inicia sesion
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
