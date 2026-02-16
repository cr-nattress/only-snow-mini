"use client";

import { usePathname } from "next/navigation";
import { ProgressDots } from "@/components/ui/progress-dots";
import { ONBOARDING_STEPS } from "@/lib/constants";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = ONBOARDING_STEPS.findIndex((s) => pathname.startsWith(s.path)) + 1;

  return (
    <div className="min-h-dvh bg-snow-surface flex flex-col">
      <div className="pt-6 pb-3 px-4 max-w-2xl mx-auto w-full">
        <ProgressDots total={ONBOARDING_STEPS.length} current={currentStep} />
      </div>
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 pb-6">
        {children}
      </div>
    </div>
  );
}
