import type { Profile } from "@/lib/types";
import { UserMenu } from "@/components/layout/UserMenu";

export function Header({ profile }: { profile: Profile }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-card/50 backdrop-blur-sm px-6 py-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {profile.role === "admin" ? "Admin" : "Usuario"}
          </span>
          <span className="ml-2">{profile.email}</span>
        </p>
      </div>
      <UserMenu profile={profile} />
    </header>
  );
}
