"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile, Role } from "@/lib/types";

export function UsersAdmin({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const res = await fetch("/api/users");
    const data = (await res.json().catch(() => null)) as
      | { users?: Profile[]; error?: string }
      | null;
    if (!res.ok) throw new Error(data?.error ?? "No se pudo cargar");
    setUsers(data?.users ?? []);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "No se pudo crear");
      toast.success("Usuario creado");
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("user");
      await refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, is_active: isActive }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "No se pudo actualizar");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: isActive } : u)),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={createUser} className="grid gap-3 rounded-xl border bg-card p-4">
        <h2 className="text-sm font-medium">Crear usuario</h2>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Nombre completo</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Contraseña temporal</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Rol</label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">user</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Creando..." : "Crear"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Requiere <code>SUPABASE_SERVICE_ROLE_KEY</code> en el servidor.
        </p>
      </form>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.is_active ? "Sí" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleActive(u.id, !u.is_active)}
                  >
                    {u.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

