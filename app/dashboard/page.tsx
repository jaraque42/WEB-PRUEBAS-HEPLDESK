import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user?.id ?? "");

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Panel</CardTitle>
          <ButtonLink href="/dashboard/tickets/new">Nuevo ticket</ButtonLink>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {typeof count === "number"
            ? `Tienes ${count} tickets creados.`
            : "Bienvenido/a."}
        </CardContent>
      </Card>
    </div>
  );
}
