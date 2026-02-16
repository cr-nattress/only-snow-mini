import { DriveRadius, SkiPreference } from "@/types/user";

export const DRIVE_RADIUS_OPTIONS: {
  value: DriveRadius;
  label: string;
  icon: string;
}[] = [
  { value: 45, label: "30–45 min", icon: "car" },
  { value: 60, label: "1 hour", icon: "car" },
  { value: 120, label: "2 hours", icon: "car" },
  { value: 180, label: "3+ hours", icon: "car" },
  { value: "fly", label: "I'll fly for powder", icon: "plane" },
];

export const PREFERENCE_OPTIONS: {
  value: SkiPreference;
  label: string;
}[] = [
  { value: "powder", label: "Powder days" },
  { value: "groomers", label: "Groomers" },
  { value: "trees", label: "Trees" },
  { value: "steeps", label: "Steeps" },
  { value: "park", label: "Park" },
  { value: "avoid_crowds", label: "Avoid crowds" },
  { value: "close_easy", label: "Close & easy" },
  { value: "storm_skiing", label: "Storm skiing" },
  { value: "bluebird", label: "Bluebird days" },
];

export const PASS_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "epic", label: "Epic Pass" },
  { value: "ikon", label: "Ikon Pass" },
  { value: "indy", label: "Indy Pass" },
  { value: "mountain_collective", label: "Mountain Collective" },
  { value: "resort_specific", label: "Resort-specific season pass" },
  { value: "none", label: "No pass / buy day tickets" },
];

export const ONBOARDING_STEPS = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/location", label: "Location" },
  { path: "/onboarding/drive-radius", label: "Drive Radius" },
  { path: "/onboarding/pass-selection", label: "Pass" },
  { path: "/onboarding/preferences", label: "Preferences" },
];
