import { notFound, redirect } from "next/navigation";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { TicketAdminControls } from "@/components/tickets/TicketAdminControls";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Message, Profile, Ticket } from "@/lib/types";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ticketId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { data: ticket } = await supabase
    .from("tickets")
    .select(
      "*, created_by_profile:profiles!tickets_created_by_fkey(full_name,email), assigned_to_profile:profiles!tickets_assigned_to_fkey(full_name,email)",
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) notFound();

  const t = ticket as unknown as Ticket & {
    created_by_profile?: { full_name: string; email: string } | null;
    assigned_to_profile?: { full_name: string; email: string } | null;
  };

  const canAccess =
    profile?.role === "admin" || t.created_by === user.id || t.assigned_to === user.id;

  if (!canAccess) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  const initialMessages = (messages as Message[]) ?? [];

  const { data: adminsData } =
    profile?.role === "admin"
      ? await supabase
          .from("profiles")
          .select("*")
          .eq("role", "admin")
          .eq("is_active", true)
          .order("full_name", { ascending: true })
      : { data: null };

  const admins = (adminsData as Profile[] | null) ?? [];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-lg">{t.title}</CardTitle>
            <p className="pt-1 text-sm text-muted-foreground">
              {t.created_by_profile?.full_name
                ? `Creado por ${t.created_by_profile.full_name}`
                : "Sin autor"}
              {t.assigned_to_profile?.full_name
                ? ` • Asignado a ${t.assigned_to_profile.full_name}`
                : " • Sin asignar"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TicketStatusBadge status={t.status} />
            <Badge variant="outline">{t.priority}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
          {t.description}
        </CardContent>
      </Card>

      {profile?.role === "admin" ? (
        <TicketAdminControls
          ticketId={ticketId}
          currentStatus={t.status}
          currentAssignee={t.assigned_to}
          admins={admins}
        />
      ) : null}

      <ChatWindow ticketId={ticketId} userId={user.id} initialMessages={initialMessages} />
    </div>
  );
}
