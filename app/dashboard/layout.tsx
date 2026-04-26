import { redirect } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar role={profile.role} />
      <div className="flex flex-1 min-w-0 flex-col">
        <Header profile={profile} />
        <main className="flex-1 min-h-0 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
