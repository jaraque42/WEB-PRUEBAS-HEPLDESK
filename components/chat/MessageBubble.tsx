import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

export function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  const created = new Date(message.created_at);
  const time = created.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-3 py-2 text-sm",
          isMine ? "bg-primary text-primary-foreground" : "bg-card",
        )}
      >
        {message.content ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : null}

        {message.file_url ? (
          <div className={cn("pt-2", message.content ? "mt-1 border-t/30" : "")}>
            {message.file_type === "image" ? (
              // Using a signed-url redirect endpoint; no Next/Image required.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/files/signed?path=${encodeURIComponent(message.file_url)}`}
                alt={message.file_name ?? "Adjunto"}
                className="max-h-64 rounded-lg border"
              />
            ) : (
              <a
                className="underline"
                href={`/api/files/signed?path=${encodeURIComponent(message.file_url)}`}
                target="_blank"
                rel="noreferrer"
              >
                {message.file_name ?? "Descargar archivo"}
              </a>
            )}
          </div>
        ) : null}

        <p className="pt-1 text-[11px] opacity-80">{time}</p>
      </div>
    </div>
  );
}

