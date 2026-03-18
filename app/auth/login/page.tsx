import { LoginForm } from "@/app/auth/login/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" ? params.redirectTo : "/dashboard";

  return <LoginForm redirectTo={redirectTo} />;
}

