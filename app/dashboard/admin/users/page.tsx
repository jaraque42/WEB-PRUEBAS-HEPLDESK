import { redirect } from "next/navigation";

import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!me?.is_active || me.role !== "admin") redirect("/dashboard");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">Usuarios</h1>
      <UsersAdmin initialUsers={(data as Profile[]) ?? []} />
    </div>
  );
}
