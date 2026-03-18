import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TicketPriority } from "@/lib/types";

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

  let query = supabase
    .from("tickets")
    .select("*")
    .order("updated_at", { ascending: false });

  if (profile.role !== "admin") {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ tickets: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | {
        title?: string;
        description?: string;
        category?: string | null;
        priority?: TicketPriority;
      }
    | null;

  if (!body?.title || !body.description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const priority = body.priority ?? "medium";

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      title: body.title,
      description: body.description,
      category: body.category ?? null,
      priority,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
