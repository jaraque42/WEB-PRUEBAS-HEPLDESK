import { buttonVariants } from "@/components/ui/button-variants";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/15,transparent)]" />

        <div className="relative z-10 w-full max-w-4xl text-center">
          <img
            src="/logo-mitie.png"
            alt="Mitie"
            width={180}
            height={54}
            className="mx-auto mb-6 h-14 w-auto object-contain"
            loading="eager"
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z"
                fill="currentColor"
              />
            </svg>
            Sistema de incidencias IT
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            INCIDENCIAS IT
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              PMR MAD
            </span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <a
              href="/auth/login"
              className={buttonVariants({
                variant: "default",
                className: "h-12 px-8 text-base",
              })}
            >
              Iniciar sesion
            </a>
            <a
              href="/auth/register"
              className={buttonVariants({
                variant: "secondary",
                className: "h-12 px-8 text-base",
              })}
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
