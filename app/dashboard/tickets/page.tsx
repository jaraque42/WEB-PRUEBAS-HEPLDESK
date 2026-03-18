import { ButtonLink } from "@/components/ui/button-link";
import { TicketCard } from "@/components/tickets/TicketCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Ticket, TicketStatus } from "@/lib/types";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const statusParam = params.status;
  const status =
    typeof statusParam === "string" ? (statusParam as TicketStatus) : null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single<Profile>();

  let query = supabase
    .from("tickets")
    .select(
      "*, created_by_profile:profiles!tickets_created_by_fkey(full_name), assigned_to_profile:profiles!tickets_assigned_to_fkey(full_name)",
    )
    .order("updated_at", { ascending: false });

  if (profile?.role !== "admin") {
    query = query.eq("created_by", user?.id ?? "");
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;

  const tickets =
    (data as unknown as (Ticket & {
      created_by_profile?: { full_name: string } | null;
      assigned_to_profile?: { full_name: string } | null;
    })[]) ?? [];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Tickets</h1>
        <ButtonLink href="/dashboard/tickets/new">Nuevo ticket</ButtonLink>
      </div>
      <div className="grid gap-3">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay tickets.</p>
        ) : (
          tickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              createdByName={t.created_by_profile?.full_name ?? null}
              assignedToName={t.assigned_to_profile?.full_name ?? null}
            />
          ))
        )}
      </div>
    </div>
  );
}
