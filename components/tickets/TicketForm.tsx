"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TicketPriority } from "@/lib/types";

const priorities: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

export function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: category || null,
          priority,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "No se pudo crear el ticket");
      if (!data?.id) throw new Error("Respuesta inválida");
      toast.success("Ticket creado");
      router.push(`/dashboard/tickets/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Título</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Descripción</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={6}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Categoría (opcional)</label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Prioridad</label>
        <Select
          value={priority}
          onValueChange={(v) => setPriority(v as TicketPriority)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear ticket"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

