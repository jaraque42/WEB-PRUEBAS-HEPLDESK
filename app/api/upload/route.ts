import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "application/pdf"]);
const BUCKET = "ticket-attachments";

function sanitize(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

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

  const form = await request.formData();
  const ticketId = String(form.get("ticketId") ?? "");
  const file = form.get("file");

  if (!ticketId) return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id,created_by,assigned_to")
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canAccess =
    profile.role === "admin" ||
    ticket.created_by === user.id ||
    ticket.assigned_to === user.id;

  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const path = `tickets/${ticketId}/${Date.now()}_${sanitize(file.name)}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ path });
}
