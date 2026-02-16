"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { useUser } from "@/context/user-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user.onboarding_complete) {
      router.replace("/onboarding/welcome");
    }
  }, [isLoaded, user.onboarding_complete, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-snow-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-snow-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      {children}
      <BottomTabBar />
    </>
  );
}
