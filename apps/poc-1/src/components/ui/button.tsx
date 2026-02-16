"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    const base = "font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-snow-primary/50 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary: "bg-snow-primary text-white hover:bg-snow-primary-hover shadow-sm shadow-snow-primary/20",
      secondary: "bg-snow-surface-raised text-snow-text border border-snow-border hover:bg-snow-surface-hover",
      ghost: "text-snow-text-muted hover:text-snow-text",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
