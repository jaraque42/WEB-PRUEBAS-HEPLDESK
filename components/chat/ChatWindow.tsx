"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Message } from "@/lib/types";
import { MessageBubble } from "@/components/chat/MessageBubble";

type Props = {
  ticketId: string;
  userId: string;
  initialMessages: Message[];
};

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export function ChatWindow({ ticketId, userId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(opts: {
    content?: string | null;
    filePath?: string | null;
    fileType?: string | null;
    fileName?: string | null;
  }) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ticketId,
        content: opts.content ?? null,
        filePath: opts.filePath ?? null,
        fileType: opts.fileType ?? null,
        fileName: opts.fileName ?? null,
      }),
    });
    const data = (await res.json().catch(() => null)) as
      | { error?: string }
      | null;
    if (!res.ok) throw new Error(data?.error ?? "No se pudo enviar el mensaje");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage({ content: text.trim() });
      setText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSending(false);
    }
  }

  async function onPickFile(file: File) {
    if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
      toast.error("Tipo de archivo no permitido (PDF/JPG/PNG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB por archivo");
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.set("ticketId", ticketId);
      form.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as
        | { path?: string; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "No se pudo subir el archivo");
      if (!data?.path) throw new Error("Respuesta inválida");

      const fileType =
        file.type === "application/pdf" ? "pdf" : "image";
      await sendMessage({
        content: text.trim() || null,
        filePath: data.path,
        fileType,
        fileName: file.name,
      });
      setText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border bg-card">
      <div className="border-b px-4 py-3 text-sm font-medium">Chat</div>
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.sender_id === userId} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED.join(",")}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onPickFile(f);
            e.currentTarget.value = "";
          }}
        />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !text.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
