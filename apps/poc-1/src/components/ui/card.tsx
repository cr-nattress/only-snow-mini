import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlighted";
}

export function Card({ variant = "default", className = "", children, ...props }: CardProps) {
  const base = "rounded-2xl p-4 transition-colors";
  const variants = {
    default: "bg-snow-surface-raised border border-snow-border",
    highlighted: "bg-snow-surface-raised border border-snow-primary/40",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
