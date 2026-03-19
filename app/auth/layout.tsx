import { AppShellProviders } from "@/components/layout/AppShellProviders";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppShellProviders>{children}</AppShellProviders>;
}

