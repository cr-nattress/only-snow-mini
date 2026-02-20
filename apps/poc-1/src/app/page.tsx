"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { LandingPage } from "@/components/landing/landing-page";

export default function RootPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (user.onboarding_complete) {
      router.replace("/dashboard");
    }
  }, [isLoaded, user.onboarding_complete, router]);

  if (!isLoaded || user.onboarding_complete) {
    return (
      <div className="min-h-screen bg-snow-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-snow-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <LandingPage />;
}
