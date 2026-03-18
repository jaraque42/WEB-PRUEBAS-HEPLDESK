"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();

  async function signOut() {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "No se pudo cerrar sesión");
      }
      router.push("/auth/login");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al cerrar sesión");
    }
  }

  const initials = profile.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", className: "h-10 px-2" }))}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials || "U"}</AvatarFallback>
        </Avatar>
        <span className="ml-2 hidden sm:inline text-sm">{profile.full_name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm">{profile.full_name}</span>
          <span className="text-xs text-muted-foreground">{profile.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
