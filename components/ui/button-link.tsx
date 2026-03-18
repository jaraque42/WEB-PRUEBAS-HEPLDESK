import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof buttonVariants>;

export function ButtonLink({
  href,
  children,
  variant,
  size,
  className,
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, className }))} href={href}>
      {children}
    </Link>
  );
}
