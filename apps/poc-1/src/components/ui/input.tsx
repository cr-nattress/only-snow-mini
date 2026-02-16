"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = "", ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-snow-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-snow-surface-raised border border-snow-border rounded-xl px-4 py-2.5 text-sm text-snow-text placeholder:text-snow-text-muted/50 focus:outline-none focus:ring-2 focus:ring-snow-primary/50 focus:border-snow-primary transition-colors ${
            icon ? "pl-10" : ""
          } ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
