import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCharts } from "@/components/admin/StatsCharts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminStatsPage() {
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

  const { count: openCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const { count: resolvedWeek } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "resolved")
    .gte("updated_at", (() => {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo.toISOString();
    })());

  const { data: byAdminRaw } = await supabase
    .from("tickets")
    .select("assigned_to")
    .not("assigned_to", "is", null);

  const { data: admins } = await supabase
    .from("profiles")
    .select("id,full_name")
    .eq("role", "admin");

  const adminName = new Map(
    (admins ?? []).map((a) => [a.id, a.full_name as string]),
  );

  const byAdminCounts = new Map<string, number>();
  (byAdminRaw ?? []).forEach((row) => {
    const id = row.assigned_to as string;
    byAdminCounts.set(id, (byAdminCounts.get(id) ?? 0) + 1);
  });

  const byAdmin = Array.from(byAdminCounts.entries()).map(([id, value]) => ({
    name: adminName.get(id) ?? id.slice(0, 8),
    value,
  }));

  const { data: byCategoryRaw } = await supabase
    .from("tickets")
    .select("category");

  const categoryCounts = new Map<string, number>();
  (byCategoryRaw ?? []).forEach((row) => {
    const name = (row.category as string | null) ?? "Sin categoría";
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  });

  const byCategory = Array.from(categoryCounts.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">Estadísticas</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets abiertos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {openCount ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resueltos (7 días)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {resolvedWeek ?? 0}
          </CardContent>
        </Card>
      </div>
      <StatsCharts byAdmin={byAdmin} byCategory={byCategory} />
    </div>
  );
}
