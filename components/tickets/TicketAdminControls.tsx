"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile, TicketStatus } from "@/lib/types";

const statuses: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

export function TicketAdminControls({
  ticketId,
  currentStatus,
  currentAssignee,
  admins,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
  currentAssignee: string | null;
  admins: Profile[];
}) {
  const router = useRouter();
  const initial = useRef<{
    status: TicketStatus;
    assignedTo: string;
  }>({
    status: currentStatus,
    assignedTo: currentAssignee ?? "unassigned",
  });
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [assignedTo, setAssignedTo] = useState<string>(currentAssignee ?? "unassigned");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = {
      status: currentStatus,
      assignedTo: currentAssignee ?? "unassigned",
    };
    initial.current = next;
    setStatus(next.status);
    setAssignedTo(next.assignedTo);
  }, [currentAssignee, currentStatus, ticketId]);

  async function save() {
    const payload: { status?: TicketStatus; assigned_to?: string | null } = {};
    if (status !== initial.current.status) payload.status = status;
    if (assignedTo !== initial.current.assignedTo) {
      payload.assigned_to = assignedTo === "unassigned" ? null : assignedTo;
    }

    if (!payload.status && !Object.prototype.hasOwnProperty.call(payload, "assigned_to")) {
      toast.message("Sin cambios");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "No se pudo actualizar");
      toast.success("Ticket actualizado");
      initial.current = {
        status,
        assignedTo,
      };
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium">Estado</p>
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) setStatus(v as TicketStatus);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Asignado a</p>
        <Select
          value={assignedTo}
          onValueChange={(v) => setAssignedTo(v ?? "unassigned")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona admin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
            {admins.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
