import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center gap-2 rounded-md border text-sm font-medium px-3.5 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-base hover:bg-accent-hover hover:border-accent-hover",
  secondary:
    "border-border text-text-primary hover:border-border-strong hover:bg-surface-2",
  ghost:
    "border-transparent text-text-secondary hover:border-border hover:bg-surface-2 hover:text-text-primary",
  danger:
    "border-border text-status-missing hover:border-status-missing hover:bg-status-missing/10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function LinkButton({
  href,
  variant = "secondary",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
