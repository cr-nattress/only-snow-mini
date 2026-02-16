"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useUser } from "@/context/user-context";
import { PREFERENCE_OPTIONS } from "@/lib/constants";
import { savePreferences } from "@/lib/api/client";
import { pocPassToApiPass } from "@/lib/api/transforms";
import { SkiPreference } from "@/types/user";

export default function PreferencesPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [selected, setSelected] = useState<SkiPreference[]>(user.preferences);

  const togglePref = (pref: SkiPreference) => {
    setSelected((prev) =>
      prev.includes(pref)
        ? prev.filter((p) => p !== pref)
        : [...prev, pref]
    );
  };

  const handleContinue = () => {
    const prefs = selected.length > 0 ? selected : ["powder" as SkiPreference, "close_easy" as SkiPreference];
    updateUser({
      preferences: prefs,
      onboarding_complete: true,
    });

    // Sync preferences to API so ranked resorts returns all US resorts.
    // Fire-and-forget — don't block navigation to dashboard.
    const loc = user.home_location;
    savePreferences({
      location_lat: loc?.lat ?? 0,
      location_lng: loc?.lng ?? 0,
      location_name: loc?.display_name,
      pass_type: user.passes.map(pocPassToApiPass),
      drive_minutes: 99999,
    }).catch(() => {});

    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-snow-text mb-1">
            What gets you excited?
          </h1>
          <p className="text-xs text-snow-text-muted">
            Pick as many as you want.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={selected.includes(opt.value)}
              onClick={() => togglePref(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-snow-surface pt-4 pb-2">
        <Button fullWidth size="lg" onClick={handleContinue}>
          Show My Resorts
        </Button>
      </div>
    </div>
  );
}
