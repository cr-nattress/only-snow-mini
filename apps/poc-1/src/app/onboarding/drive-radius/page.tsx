"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectCard } from "@/components/ui/select-card";
import { useUser } from "@/context/user-context";
import { DRIVE_RADIUS_OPTIONS } from "@/lib/constants";
import { DriveRadius } from "@/types/user";

export default function DriveRadiusPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [selected, setSelected] = useState<DriveRadius>(user.max_drive_minutes);

  const handleContinue = () => {
    updateUser({ max_drive_minutes: selected });
    router.push("/onboarding/pass-selection");
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-snow-text mb-1">
            How far will you drive?
          </h1>
          <p className="text-xs text-snow-text-muted">
            You can change this anytime.
          </p>
        </div>

        <div className="space-y-2">
          {DRIVE_RADIUS_OPTIONS.map((opt) => (
            <SelectCard
              key={String(opt.value)}
              label={opt.label}
              selected={selected === opt.value}
              onClick={() => setSelected(opt.value)}
              icon={
                opt.value === "fly"
                  ? <Plane className="w-5 h-5" />
                  : <Car className="w-5 h-5" />
              }
            />
          ))}
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
