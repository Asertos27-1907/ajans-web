import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-[0_10px_28px_rgba(122,31,43,0.22)]",
  secondary: "bg-secondary text-white hover:bg-secondary-hover",
  ghost: "bg-transparent text-ink hover:bg-primary-soft hover:text-primary",
  danger: "bg-danger text-white hover:opacity-90",
  outline:
    "border border-border-strong bg-surface text-ink hover:border-primary/45 hover:bg-primary-soft hover:text-primary",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 h-10 px-3 text-sm",
  md: "min-h-11 h-11 px-5 text-sm",
  lg: "min-h-12 h-12 px-6 text-base sm:px-7",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors duration-200",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
