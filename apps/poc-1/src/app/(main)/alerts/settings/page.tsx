"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Card } from "@/components/ui/card";
import { AlertSettingRow } from "@/components/alerts/alert-setting-row";
import { useUser } from "@/context/user-context";

export default function AlertSettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const settings = user.alert_settings;

  const update = (key: string, value: string) => {
    updateUser({
      alert_settings: { ...settings, [key]: key === "min_snowfall_inches" ? Number(value) : value },
    });
  };

  return (
    <ScreenContainer>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-snow-text-muted hover:text-snow-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-snow-text">Alert Settings</h1>
        </div>

        <Card className="space-y-5">
          <AlertSettingRow
            label="Frequency"
            options={[
              { value: "big_storms", label: "Big storms" },
              { value: "any_snow", label: "Any snow" },
              { value: "weekly", label: "Weekly" },
              { value: "off", label: "Off" },
            ]}
            selected={settings.frequency}
            onSelect={(v) => update("frequency", v)}
          />
          <AlertSettingRow
            label="Timing"
            options={[
              { value: "night_before", label: "Night before" },
              { value: "early_morning", label: "5am" },
              { value: "both", label: "Both" },
            ]}
            selected={settings.timing}
            onSelect={(v) => update("timing", v)}
          />
          <AlertSettingRow
            label="Minimum snowfall"
            options={[
              { value: "0", label: "Any" },
              { value: "3", label: '3"+' },
              { value: "6", label: '6"+' },
              { value: "12", label: '12"+' },
            ]}
            selected={String(settings.min_snowfall_inches)}
            onSelect={(v) => update("min_snowfall_inches", v)}
          />
          <AlertSettingRow
            label="Resorts"
            options={[
              { value: "all", label: "All nearby" },
              { value: "favorites", label: "Favorites" },
              { value: "pass_only", label: "Pass only" },
            ]}
            selected={settings.resort_filter}
            onSelect={(v) => update("resort_filter", v)}
          />
        </Card>
      </div>
    </ScreenContainer>
  );
}
