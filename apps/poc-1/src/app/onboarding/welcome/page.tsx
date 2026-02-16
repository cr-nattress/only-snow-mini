"use client";

import { useRouter } from "next/navigation";
import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";

export default function WelcomePage() {
  const router = useRouter();
  const { updateUser } = useUser();

  const handleSkip = () => {
    updateUser({
      max_drive_minutes: 60,
      preferences: ["powder", "close_easy"],
      onboarding_complete: true,
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-snow-primary/15 flex items-center justify-center">
          <Mountain className="w-8 h-8 text-snow-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-snow-text mb-2">
            Know exactly where to ski — every day.
          </h1>
          <p className="text-snow-text-muted text-sm">
            Tell us a few things and we&apos;ll find your best ski days.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-snow-surface pt-4 pb-2 space-y-3">
        <Button fullWidth size="lg" onClick={() => router.push("/onboarding/location")}>
          Continue
        </Button>
        <div className="flex justify-between text-xs">
          <button className="text-snow-text-muted hover:text-snow-text transition-colors">
            Sign in
          </button>
          <button
            onClick={handleSkip}
            className="text-snow-text-muted hover:text-snow-text transition-colors"
          >
            Skip personalization
          </button>
        </div>
      </div>
    </div>
  );
}
