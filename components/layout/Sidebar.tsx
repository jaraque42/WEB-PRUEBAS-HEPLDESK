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
    label: "Estadísticas",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["admin"],
  },
];

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
      <div className="px-4 py-4 border-b">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Helpdesk
        </Link>
      </div>
      <nav className="flex-1 p-2">
        <ul className="flex flex-col gap-1">
          {items
            .filter((it) => !it.roles || it.roles.includes(role))
            .map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
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
      <div className="p-4 border-t text-xs text-muted-foreground">
        {role === "admin" ? "Modo Admin" : "Modo Usuario"}
      </div>
    </aside>
  );
}

