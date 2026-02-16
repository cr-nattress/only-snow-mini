"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { getStorageItem, setStorageItem } from "@/lib/storage";

const STORAGE_KEY = "onlysnow_app";

interface AppState {
  dismissedAlerts: string[];
}

const DEFAULT_APP_STATE: AppState = {
  dismissedAlerts: [],
};

interface AppContextValue {
  appState: AppState;
  dismissAlert: (alertId: string) => void;
  isAlertDismissed: (alertId: string) => boolean;
  resetAppState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(() =>
    getStorageItem<AppState>(STORAGE_KEY, DEFAULT_APP_STATE)
  );

  const dismissAlert = useCallback((alertId: string) => {
    setAppState((prev) => {
      const next = {
        ...prev,
        dismissedAlerts: [...prev.dismissedAlerts, alertId],
      };
      setStorageItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isAlertDismissed = useCallback(
    (alertId: string) => appState.dismissedAlerts.includes(alertId),
    [appState.dismissedAlerts]
  );

  const resetAppState = useCallback(() => {
    setAppState(DEFAULT_APP_STATE);
    setStorageItem(STORAGE_KEY, DEFAULT_APP_STATE);
  }, []);

  return (
    <AppContext.Provider value={{ appState, dismissAlert, isAlertDismissed, resetAppState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
