import { Ticket } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/90 via-primary to-primary/80 items-center justify-center p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white/10,transparent_50%)]" />
        <div className="relative z-10 max-w-md text-primary-foreground">
          <div className="mb-6 inline-flex rounded-3xl bg-white p-3 shadow-lg">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">INCIDENCIAS IT</h2>
          <p className="mt-3 text-lg text-primary-foreground/80">
            Gestiona tickets, comunica con tu equipo y resuelve incidencias de forma eficiente.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 text-xl font-bold lg:hidden"
        >
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          INCIDENCIAS IT
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
