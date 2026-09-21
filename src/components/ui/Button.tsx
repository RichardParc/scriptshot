import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center gap-2 rounded-md border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

const sizes: Record<ButtonSize, string> = {
  sm: "text-sm px-2.5 py-1.5",
  md: "text-base px-3.5 py-2",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-accent-ink hover:bg-accent-hover hover:border-accent-hover",
  secondary:
    "border-border text-text-primary hover:border-border-strong hover:bg-surface-2",
  ghost:
    "border-transparent text-text-secondary hover:border-border hover:bg-surface-2 hover:text-text-primary",
  danger:
    "border-border text-status-missing hover:border-status-missing hover:bg-status-missing/10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "secondary", size = "md", className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
