"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import { PASS_OPTIONS } from "@/lib/constants";
import { PassType } from "@/types/user";

export default function PassSelectionPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [selected, setSelected] = useState<PassType[]>(user.passes);
  const [resortPass, setResortPass] = useState(user.specific_resort_pass ?? "");

  const togglePass = (pass: PassType) => {
    if (pass === "none") {
      setSelected(["none"]);
      return;
    }
    setSelected((prev) => {
      const filtered = prev.filter((p) => p !== "none");
      if (filtered.includes(pass)) {
        return filtered.filter((p) => p !== pass);
      }
      return [...filtered, pass];
    });
  };

  const handleContinue = () => {
    updateUser({
      passes: selected,
      specific_resort_pass: selected.includes("resort_specific") ? resortPass : null,
    });
    router.push("/onboarding/preferences");
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-snow-text mb-1">
            Which pass this season?
          </h1>
          <p className="text-xs text-snow-text-muted">
            Select all that apply.
          </p>
        </div>

        <div className="space-y-2">
          {PASS_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.value as PassType);
            return (
              <div key={opt.value}>
                <button
                  type="button"
                  onClick={() => togglePass(opt.value as PassType)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-150 active:scale-[0.98] ${
                    isSelected
                      ? "bg-snow-primary/10 border border-snow-primary"
                      : "bg-snow-surface-raised border border-snow-border hover:border-snow-primary/40"
                  }`}
                >
                  <span className="text-sm font-medium text-snow-text">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-snow-primary" />}
                </button>
                {opt.value === "resort_specific" && isSelected && (
                  <div className="mt-2 ml-4">
                    <Input
                      placeholder="Enter resort name"
                      value={resortPass}
                      onChange={(e) => setResortPass(e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-snow-surface pt-4 pb-2">
        <Button fullWidth size="lg" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
