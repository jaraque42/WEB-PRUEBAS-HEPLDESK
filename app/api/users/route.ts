import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function GET() {
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

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ users: data ?? [] });
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
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        full_name?: string;
        email?: string;
        password?: string;
        role?: Role;
      }
    | null;

  if (!body?.full_name || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server misconfigured" },
      { status: 500 },
    );
  }
  const { data: created, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.full_name },
  });

  if (error || !created.user) {
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 400 });
  }

  const { error: insertError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: body.full_name,
    email: body.email,
    role: body.role,
    is_active: true,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user.id });
}

export async function PATCH(request: Request) {
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
    | { id?: string; is_active?: boolean }
    | null;

  if (!body?.id || typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: body.is_active })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
