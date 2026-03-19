import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#5B2D8E] via-[#7B2D8E] to-[#E8451C] items-center justify-center p-12 overflow-hidden">
        <Image
          src="/logo-mitie.png"
          alt=""
          width={700}
          height={700}
          className="absolute inset-0 m-auto opacity-[0.06] w-[70%] max-w-[700px] pointer-events-none select-none"
        />
        <div className="relative z-10 max-w-md text-white">
          <Image
            src="/logo-mitie.png"
            alt="Mitie"
            width={160}
            height={48}
            className="mb-6 h-12 w-auto object-contain"
          />
          <h2 className="text-3xl font-bold tracking-tight">INCIDENCIAS IT PMR MAD</h2>
          <p className="mt-3 text-lg text-white/80">
            Ingresa tus credenciales para acceder al sistema de incidencias.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden"
        >
          <Image src="/logo-icon.svg" alt="Mitie" width={24} height={24} className="h-6 w-6" />
          INCIDENCIAS IT
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
