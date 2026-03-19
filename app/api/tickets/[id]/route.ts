import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TicketStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ticket });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { status?: TicketStatus; assigned_to?: string | null }
    | null;

  const { data: before } = await supabase
    .from("tickets")
    .select("status,assigned_to")
    .eq("id", id)
    .maybeSingle();

  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextStatus = body?.status ?? before.status;
  const wantsAssigneeUpdate =
    !!body && Object.prototype.hasOwnProperty.call(body, "assigned_to");
  const nextAssigned = wantsAssigneeUpdate ? (body.assigned_to ?? null) : before.assigned_to;

  if (wantsAssigneeUpdate && nextAssigned !== null) {
    if (!nextAssigned) {
      return NextResponse.json({ error: "assigned_to invalido" }, { status: 400 });
    }

    const { data: assignee, error: assigneeError } = await supabase
      .from("profiles")
      .select("id,role,is_active")
      .eq("id", nextAssigned)
      .maybeSingle();

    if (assigneeError) {
      return NextResponse.json({ error: assigneeError.message }, { status: 400 });
    }

    if (!assignee || !assignee.is_active || assignee.role !== "admin") {
      return NextResponse.json(
        { error: "assigned_to debe ser un admin activo" },
        { status: 400 },
      );
    }
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: nextStatus,
      assigned_to: nextAssigned,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const history: {
    ticket_id: string;
    changed_by: string;
    field_changed: string;
    old_value: string | null;
    new_value: string | null;
  }[] = [];

  if (before.status !== nextStatus) {
    history.push({
      ticket_id: id,
      changed_by: user.id,
      field_changed: "status",
      old_value: before.status,
      new_value: nextStatus,
    });
  }

  if (before.assigned_to !== nextAssigned) {
    history.push({
      ticket_id: id,
      changed_by: user.id,
      field_changed: "assigned_to",
      old_value: before.assigned_to,
      new_value: nextAssigned,
    });
  }

  if (history.length > 0) {
    await supabase.from("ticket_history").insert(history);
  }

  return NextResponse.json({ ok: true });
}
