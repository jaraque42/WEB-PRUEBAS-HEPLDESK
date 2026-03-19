import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Ticket, Plus, Clock, CheckCircle2 } from "lucide-react";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: totalCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user?.id ?? "");

  const { count: openCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user?.id ?? "")
    .eq("status", "open");

  const { count: resolvedCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user?.id ?? "")
    .eq("status", "resolved");

  const { count: inProgressCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user?.id ?? "")
    .eq("status", "in_progress");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, resumen de tu actividad</p>
        </div>
        <ButtonLink href="/dashboard/tickets/new" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo ticket
        </ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-xl bg-primary/10 p-2.5">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-xl bg-blue-500/10 p-2.5">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abiertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{openCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-xl bg-purple-500/10 p-2.5">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{inProgressCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 rounded-xl bg-emerald-500/10 p-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resueltos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{resolvedCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
