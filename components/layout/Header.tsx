import type { Profile } from "@/lib/types";
import { UserMenu } from "@/components/layout/UserMenu";

export function Header({ profile }: { profile: Profile }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">
          {profile.role === "admin" ? "Admin" : "Usuario"} • {profile.email}
        </p>
      </div>
      <UserMenu profile={profile} />
    </header>
  );
}

