import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "ticket-attachments";

function extractTicketId(path: string) {
  const parts = path.split("/");
  if (parts.length >= 2 && parts[0] === "tickets") return parts[1] ?? null;
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const supabaseClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    return NextResponse.json({ error: "Inactive user" }, { status: 403 });
  }

  const ticketId = extractTicketId(path);
  if (!ticketId) return NextResponse.json({ error: "Invalid path" }, { status: 400 });

  const { data: ticket } = await supabaseClient
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

  const { data, error } = await supabaseClient.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 400 });
  }

  return NextResponse.redirect(data.signedUrl);
}
