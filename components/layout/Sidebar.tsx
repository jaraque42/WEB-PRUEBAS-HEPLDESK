import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Ticket, Users, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
};

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "Panel",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/dashboard/tickets",
    label: "Tickets",
    icon: <Ticket className="h-4 w-4" />,
  },
  {
    href: "/dashboard/admin/users",
    label: "Usuarios",
    icon: <Users className="h-4 w-4" />,
    roles: ["admin"],
  },
  {
    href: "/dashboard/admin/stats",
    label: "Estadisticas",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["admin"],
  },
];

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo-icon.svg" alt="Mitie" width={32} height={32} className="h-8 w-8" />
          <span className="font-bold text-base tracking-tight">INCIDENCIAS IT</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Menu
        </p>
        <ul className="flex flex-col gap-0.5">
          {items
            .filter((it) => !it.roles || it.roles.includes(role))
            .map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "transition-colors",
                  )}
                >
                  {it.icon}
                  {it.label}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-sidebar-foreground/50">
            {role === "admin" ? "Administrador" : "Usuario"}
          </span>
        </div>
      </div>
    </aside>
  );
}
