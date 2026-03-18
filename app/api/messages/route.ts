import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    return NextResponse.json({ error: "Inactive user" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        ticketId?: string;
        content?: string | null;
        filePath?: string | null;
        fileType?: string | null;
        fileName?: string | null;
      }
    | null;

  if (!body?.ticketId) {
    return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id,created_by,assigned_to")
    .eq("id", body.ticketId)
    .maybeSingle();

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canAccess =
    profile.role === "admin" ||
    ticket.created_by === user.id ||
    ticket.assigned_to === user.id;

  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const content = body.content?.trim() ? body.content.trim() : null;
  const file_url = body.filePath ?? null;
  const file_type = body.fileType ?? null;
  const file_name = body.fileName ?? null;

  if (!content && !file_url) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({
    ticket_id: body.ticketId,
    sender_id: user.id,
    content,
    file_url,
    file_type,
    file_name,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
