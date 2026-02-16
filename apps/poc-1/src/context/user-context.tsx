"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { UserProfile, DEFAULT_USER_PROFILE } from "@/types/user";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { savePreferences } from "@/lib/api/client";
import { pocPassToApiPass } from "@/lib/api/transforms";

const STORAGE_KEY = "onlysnow_user";

interface UserContextValue {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  resetUser: () => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() =>
    getStorageItem<UserProfile>(STORAGE_KEY, DEFAULT_USER_PROFILE)
  );
  const [isLoaded] = useState(true);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      setStorageItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const resetUser = useCallback(() => {
    setUser(DEFAULT_USER_PROFILE);
    setStorageItem(STORAGE_KEY, DEFAULT_USER_PROFILE);
  }, []);

  // Sync preferences to API once per session so ranked resorts returns all US resorts.
  useEffect(() => {
    if (!user.onboarding_complete) return;
    const SYNC_KEY = "onlysnow_prefs_synced";
    if (typeof window !== "undefined" && sessionStorage.getItem(SYNC_KEY)) return;

    const loc = user.home_location;
    savePreferences({
      location_lat: loc?.lat ?? 0,
      location_lng: loc?.lng ?? 0,
      location_name: loc?.display_name,
      pass_type: user.passes.map(pocPassToApiPass),
      drive_minutes: 99999,
    })
      .then(() => {
        if (typeof window !== "undefined") sessionStorage.setItem(SYNC_KEY, "1");
      })
      .catch(() => {});
  }, [user.onboarding_complete]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
