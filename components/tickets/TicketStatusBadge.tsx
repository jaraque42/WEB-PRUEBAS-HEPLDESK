import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/types";

const labels: Record<TicketStatus, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const variants: Record<TicketStatus, "default" | "secondary" | "destructive"> =
  {
    open: "default",
    in_progress: "secondary",
    resolved: "default",
    closed: "secondary",
  };

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

