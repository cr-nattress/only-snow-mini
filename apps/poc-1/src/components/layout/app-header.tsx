"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Home, Bell, User, RotateCcw } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useApp } from "@/context/app-context";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/resorts", label: "Resorts", icon: Mountain },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resetUser } = useUser();
  const { resetAppState } = useApp();

  const handleReset = () => {
    resetUser();
    resetAppState();
    router.push("/onboarding/welcome");
  };

  return (
    <header className="sticky top-0 z-50 bg-snow-surface/90 backdrop-blur-lg border-b border-snow-border">
      {/* Mobile / Tablet */}
      <div className="md:hidden flex items-center justify-between h-12 px-4">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <Mountain className="w-4 h-4 text-snow-primary" />
          <span className="text-sm font-bold text-snow-text">OnlySnow</span>
        </Link>
        <button
          onClick={handleReset}
          title="Reset app state"
          className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium text-snow-text-muted/60 hover:text-snow-text transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center h-14 px-6 lg:px-10">
        <Link href="/dashboard" className="flex items-center gap-2 mr-auto">
          <Mountain className="w-5 h-5 text-snow-primary" />
          <span className="text-base font-bold text-snow-text">OnlySnow</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-snow-primary bg-snow-primary/10"
                    : "text-snow-text-muted hover:text-snow-text hover:bg-snow-surface-hover"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.5} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleReset}
            title="Reset app state"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-snow-text-muted/50 hover:text-snow-text transition-colors ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </nav>
      </div>
    </header>
  );
}
