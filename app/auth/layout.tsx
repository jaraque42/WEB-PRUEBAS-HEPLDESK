import { AppShellProviders } from "@/components/layout/AppShellProviders";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProviders>
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </AppShellProviders>
  );
}

