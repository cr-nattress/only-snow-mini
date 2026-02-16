export interface UserLocation {
  lat: number;
  lng: number;
  display_name: string;
}

export type DriveRadius = 45 | 60 | 120 | 180 | "fly";

export type PassType = "epic" | "ikon" | "indy" | "mountain_collective" | "resort_specific" | "none";

export type SkiPreference =
  | "powder"
  | "groomers"
  | "trees"
  | "steeps"
  | "park"
  | "avoid_crowds"
  | "close_easy"
  | "storm_skiing"
  | "bluebird";

export type AlertFrequency = "big_storms" | "any_snow" | "weekly" | "off";
export type AlertTiming = "night_before" | "early_morning" | "both";
export type AlertResortFilter = "all" | "favorites" | "pass_only";

export interface AlertSettings {
  frequency: AlertFrequency;
  timing: AlertTiming;
  min_snowfall_inches: number;
  resort_filter: AlertResortFilter;
}

export type SkiDays = "weekends" | "weekdays" | "flexible";
export type StormDrivingComfort = "low" | "moderate" | "high";
export type CrowdSensitivity = "low" | "moderate" | "high";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert" | "backcountry";

export type YesNo = "yes" | "no";
export type DrivePreference = "safe_easy" | "best_snow";

export interface DeferredProfile {
  // Schedule
  ski_days?: SkiDays;
  midweek_powder?: YesNo;
  remote_ski_mornings?: YesNo;
  // Travel Tolerance
  early_morning_willing?: YesNo;
  night_driving?: YesNo;
  avoid_mountain_passes?: YesNo;
  drive_preference?: DrivePreference;
  storm_driving_comfort?: StormDrivingComfort;
  // Crowd Tolerance
  drive_farther_avoid_crowds?: YesNo;
  lift_line_sensitivity?: "low" | "moderate" | "high";
  prefer_smaller_resorts?: YesNo;
  crowd_sensitivity?: CrowdSensitivity;
  // Skill Level
  skill_level?: SkillLevel;
}

export interface UserProfile {
  home_location: UserLocation | null;
  max_drive_minutes: DriveRadius;
  passes: PassType[];
  specific_resort_pass: string | null;
  preferences: SkiPreference[];
  alert_settings: AlertSettings;
  deferred_profile: DeferredProfile;
  onboarding_complete: boolean;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  home_location: null,
  max_drive_minutes: 60,
  passes: [],
  specific_resort_pass: null,
  preferences: [],
  alert_settings: {
    frequency: "big_storms",
    timing: "night_before",
    min_snowfall_inches: 6,
    resort_filter: "pass_only",
  },
  deferred_profile: {},
  onboarding_complete: false,
};
