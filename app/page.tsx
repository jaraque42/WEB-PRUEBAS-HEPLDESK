import { ButtonLink } from "@/components/ui/button-link";

export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-3xl">
        <div className="rounded-2xl border bg-card p-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Helpdesk / Tickets
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión para crear y gestionar tickets, chatear en tiempo
              real y adjuntar archivos.
            </p>
            <div className="flex gap-3 pt-4">
              <ButtonLink href="/auth/login">Entrar</ButtonLink>
              <ButtonLink href="/auth/register" variant="secondary">
                Registrarse
              </ButtonLink>
            </div>
          </div>
        </div>
        <p className="pt-6 text-xs text-muted-foreground">
          Requiere configurar Supabase en <code>.env.local</code>.
        </p>
      </div>
    </main>
  );
}
