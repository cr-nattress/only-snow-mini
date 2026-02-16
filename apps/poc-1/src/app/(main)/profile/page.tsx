"use client";

import { useRouter } from "next/navigation";
import { ScreenContainer } from "@/components/layout/screen-container";
import { ProfileSection } from "@/components/profile/profile-section";
import { DeferredSection } from "@/components/profile/deferred-section";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { AlertSettingRow } from "@/components/alerts/alert-setting-row";
import { useUser } from "@/context/user-context";
import { useApp } from "@/context/app-context";
import { PREFERENCE_OPTIONS, PASS_OPTIONS, DRIVE_RADIUS_OPTIONS } from "@/lib/constants";
import { SkiPreference, DeferredProfile } from "@/types/user";

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, resetUser } = useUser();
  const { resetAppState } = useApp();
  const dp = user.deferred_profile;

  const passLabels = user.passes
    .map((p) => PASS_OPTIONS.find((o) => o.value === p)?.label ?? p)
    .join(", ") || "None";

  const driveLabel = DRIVE_RADIUS_OPTIONS.find(
    (o) => o.value === user.max_drive_minutes
  )?.label ?? String(user.max_drive_minutes);

  const togglePref = (pref: SkiPreference) => {
    const next = user.preferences.includes(pref)
      ? user.preferences.filter((p) => p !== pref)
      : [...user.preferences, pref];
    updateUser({ preferences: next });
  };

  const updateDeferred = (updates: Partial<DeferredProfile>) => {
    updateUser({ deferred_profile: { ...dp, ...updates } });
  };

  const handleReset = () => {
    resetUser();
    resetAppState();
    router.push("/onboarding/welcome");
  };

  const scheduleComplete = !!(dp.ski_days && dp.midweek_powder && dp.remote_ski_mornings);
  const travelComplete = !!(dp.early_morning_willing && dp.night_driving && dp.avoid_mountain_passes && dp.drive_preference && dp.storm_driving_comfort);
  const crowdComplete = !!(dp.drive_farther_avoid_crowds && dp.lift_line_sensitivity && dp.prefer_smaller_resorts);

  return (
    <ScreenContainer>
      <div className="space-y-3">
        <h1 className="text-lg font-bold text-snow-text">Profile</h1>

        <ProfileSection title="Location" value={user.home_location?.display_name ?? "Not set"} />
        <ProfileSection title="Drive Radius" value={driveLabel} />
        <ProfileSection title="Passes" value={passLabels} />

        <div className="rounded-xl bg-snow-surface-raised border border-snow-border px-3 py-2.5">
          <div className="text-[11px] text-snow-text-muted uppercase tracking-wider mb-2">Preferences</div>
          <div className="flex flex-wrap gap-1.5">
            {PREFERENCE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={user.preferences.includes(opt.value)}
                onClick={() => togglePref(opt.value)}
              />
            ))}
          </div>
        </div>

        <div className="pt-1">
          <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">
            Improve Recommendations
          </h2>
          <div className="space-y-2">
            <DeferredSection title="Schedule" description="When can you ski?" completed={scheduleComplete}>
              <div className="space-y-4">
                <AlertSettingRow
                  label="Usual days"
                  options={[
                    { value: "weekends", label: "Weekends" },
                    { value: "weekdays", label: "Weekdays" },
                    { value: "flexible", label: "Flexible" },
                  ]}
                  selected={dp.ski_days ?? ""}
                  onSelect={(v) => updateDeferred({ ski_days: v as "weekends" | "weekdays" | "flexible" })}
                />
                <AlertSettingRow
                  label="Mid-week powder days?"
                  options={YES_NO}
                  selected={dp.midweek_powder ?? ""}
                  onSelect={(v) => updateDeferred({ midweek_powder: v as "yes" | "no" })}
                />
                <AlertSettingRow
                  label="Remote work + ski mornings?"
                  options={YES_NO}
                  selected={dp.remote_ski_mornings ?? ""}
                  onSelect={(v) => updateDeferred({ remote_ski_mornings: v as "yes" | "no" })}
                />
              </div>
            </DeferredSection>

            <DeferredSection title="Travel" description="How far for powder?" completed={travelComplete}>
              <div className="space-y-4">
                <AlertSettingRow
                  label="Early wake-up for storms?"
                  options={YES_NO}
                  selected={dp.early_morning_willing ?? ""}
                  onSelect={(v) => updateDeferred({ early_morning_willing: v as "yes" | "no" })}
                />
                <AlertSettingRow
                  label="Night driving for powder?"
                  options={YES_NO}
                  selected={dp.night_driving ?? ""}
                  onSelect={(v) => updateDeferred({ night_driving: v as "yes" | "no" })}
                />
                <AlertSettingRow
                  label="Avoid mountain passes?"
                  options={YES_NO}
                  selected={dp.avoid_mountain_passes ?? ""}
                  onSelect={(v) => updateDeferred({ avoid_mountain_passes: v as "yes" | "no" })}
                />
                <AlertSettingRow
                  label="Drive preference"
                  options={[
                    { value: "safe_easy", label: "Safe & easy" },
                    { value: "best_snow", label: "Best snow" },
                  ]}
                  selected={dp.drive_preference ?? ""}
                  onSelect={(v) => updateDeferred({ drive_preference: v as "safe_easy" | "best_snow" })}
                />
                <AlertSettingRow
                  label="Storm driving comfort"
                  options={[
                    { value: "low", label: "Avoid" },
                    { value: "moderate", label: "Moderate" },
                    { value: "high", label: "Send it" },
                  ]}
                  selected={dp.storm_driving_comfort ?? ""}
                  onSelect={(v) => updateDeferred({ storm_driving_comfort: v as "low" | "moderate" | "high" })}
                />
              </div>
            </DeferredSection>

            <DeferredSection title="Crowds" description="Crowd sensitivity" completed={crowdComplete}>
              <div className="space-y-4">
                <AlertSettingRow
                  label="Drive farther to avoid crowds?"
                  options={YES_NO}
                  selected={dp.drive_farther_avoid_crowds ?? ""}
                  onSelect={(v) => updateDeferred({ drive_farther_avoid_crowds: v as "yes" | "no" })}
                />
                <AlertSettingRow
                  label="Lift lines ruin powder day?"
                  options={[
                    { value: "low", label: "Not really" },
                    { value: "moderate", label: "Somewhat" },
                    { value: "high", label: "Absolutely" },
                  ]}
                  selected={dp.lift_line_sensitivity ?? ""}
                  onSelect={(v) => updateDeferred({ lift_line_sensitivity: v as "low" | "moderate" | "high" })}
                />
                <AlertSettingRow
                  label="Prefer smaller resorts?"
                  options={YES_NO}
                  selected={dp.prefer_smaller_resorts ?? ""}
                  onSelect={(v) => updateDeferred({ prefer_smaller_resorts: v as "yes" | "no" })}
                />
              </div>
            </DeferredSection>

            <DeferredSection title="Skill" description="Terrain matching" completed={!!dp.skill_level}>
              <AlertSettingRow
                label="Skill level"
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                  { value: "expert", label: "Expert" },
                  { value: "backcountry", label: "Backcountry" },
                ]}
                selected={dp.skill_level ?? ""}
                onSelect={(v) => updateDeferred({ skill_level: v as "beginner" | "intermediate" | "advanced" | "expert" | "backcountry" })}
              />
            </DeferredSection>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="secondary" fullWidth size="sm" onClick={handleReset}>
            Reset & Restart
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
}
