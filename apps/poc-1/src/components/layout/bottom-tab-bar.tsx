"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mountain, Bell, User } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/resorts", label: "Resorts", icon: Mountain },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-snow-surface/90 backdrop-blur-lg border-t border-snow-border z-50 md:hidden">
      <div className="flex justify-around items-center h-14 max-w-2xl mx-auto pb-safe">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? "text-snow-primary" : "text-snow-text-muted"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
