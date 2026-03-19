import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Ticket, MessageCircle, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/15,transparent)]" />

        <div className="relative z-10 w-full max-w-4xl text-center">
          <Image
            src="/logo-mitie.png"
            alt="Mitie"
            width={180}
            height={54}
            className="mx-auto mb-6 h-14 w-auto object-contain"
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
            <Zap className="h-3.5 w-3.5" />
            Sistema de incidencias IT
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            INCIDENCIAS IT
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              PMR MAD
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Crea incidencias, asigna responsables, chatea en tiempo real y adjunta
            archivos. Todo desde una interfaz moderna y sencilla.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <ButtonLink href="/auth/login" className="h-12 px-8 text-base">
              Iniciar sesion
            </ButtonLink>
            <ButtonLink
              href="/auth/register"
              variant="secondary"
              className="h-12 px-8 text-base"
            >
              Crear cuenta
            </ButtonLink>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
            <div className="group rounded-2xl border bg-card/50 backdrop-blur-sm p-6 text-left transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Incidencias</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea y rastrea incidencias con prioridad y categorias.
              </p>
            </div>
            <div className="group rounded-2xl border bg-card/50 backdrop-blur-sm p-6 text-left transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Chat en vivo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comunicate con tu equipo directamente en cada ticket.
              </p>
            </div>
            <div className="group rounded-2xl border bg-card/50 backdrop-blur-sm p-6 text-left transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Panel admin</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gestiona usuarios, estadisticas y asignaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
