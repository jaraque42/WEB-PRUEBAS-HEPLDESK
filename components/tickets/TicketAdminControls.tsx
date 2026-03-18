"use client";

import { useState } from "react";
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
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [assignedTo, setAssignedTo] = useState<string>(currentAssignee ?? "unassigned");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          assigned_to: assignedTo === "unassigned" ? null : assignedTo,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "No se pudo actualizar");
      toast.success("Ticket actualizado");
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
