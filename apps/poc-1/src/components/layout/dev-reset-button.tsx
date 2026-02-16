"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useApp } from "@/context/app-context";

export function DevResetButton() {
  const router = useRouter();
  const { resetUser } = useUser();
  const { resetAppState } = useApp();

  const handleReset = () => {
    resetUser();
    resetAppState();
    router.push("/onboarding/welcome");
  };

  return (
    <button
      onClick={handleReset}
      title="Reset app state"
      className="fixed top-3 right-3 z-[60] flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium text-snow-text-muted/60 hover:text-snow-text bg-snow-surface-raised/80 backdrop-blur border border-snow-border/50 hover:border-snow-border transition-all opacity-40 hover:opacity-100"
    >
      <RotateCcw className="w-3 h-3" />
      Reset
    </button>
  );
}
