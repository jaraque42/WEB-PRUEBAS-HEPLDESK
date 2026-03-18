import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import type { Ticket, TicketPriority } from "@/lib/types";

const priorityLabels: Record<TicketPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

export function TicketCard({
  ticket,
  createdByName,
  assignedToName,
}: {
  ticket: Ticket;
  createdByName?: string | null;
  assignedToName?: string | null;
}) {
  return (
    <Card className="hover:bg-accent/30 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">
            <Link className="underline-offset-4 hover:underline" href={`/dashboard/tickets/${ticket.id}`}>
              {ticket.title}
            </Link>
          </CardTitle>
          <p className="text-xs text-muted-foreground pt-1 truncate">
            {ticket.category ? `${ticket.category} • ` : ""}
            {createdByName ? `Creado por ${createdByName}` : "Sin autor"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <TicketStatusBadge status={ticket.status} />
          <Badge variant="outline">{priorityLabels[ticket.priority]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="line-clamp-2">{ticket.description}</p>
        <p className="pt-2 text-xs">
          {assignedToName ? `Asignado a ${assignedToName}` : "Sin asignar"}
        </p>
      </CardContent>
    </Card>
  );
}

