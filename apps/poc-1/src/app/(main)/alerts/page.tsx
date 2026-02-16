"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { ScreenContainer } from "@/components/layout/screen-container";
import { AlertCard } from "@/components/alerts/alert-card";
import { useApp } from "@/context/app-context";
import { useNotifications, formatFetchedAt } from "@/hooks/use-api";
import type { PowderAlert } from "@/types/alert";
import type { ApiNotification } from "@/types/api";

// Adapt API notification to PowderAlert shape for the AlertCard component
function notificationToAlert(n: ApiNotification): PowderAlert {
  return {
    id: n.id,
    resort_name: n.title,
    resort_id: n.resort_slug,
    storm_id: "storm-1", // API gap: notifications don't include storm_id
    snowfall: n.body,
    timing: "",
    best_window: "",
    travel: "",
    created_at: n.sent_at,
    dismissed: n.opened_at !== null,
  };
}

export default function AlertsPage() {
  const { dismissAlert, isAlertDismissed } = useApp();
  const { data: notifData, loading } = useNotifications();

  // Use API notifications if available, otherwise empty
  const alerts = useMemo((): PowderAlert[] => {
    if (notifData && notifData.notifications.length > 0) {
      return notifData.notifications.map(notificationToAlert);
    }
    return [];
  }, [notifData]);

  const activeAlerts = alerts.filter((a) => !a.dismissed && !isAlertDismissed(a.id));
  const dismissedAlerts = alerts.filter((a) => a.dismissed || isAlertDismissed(a.id));
  const fetchedAt = notifData?._meta.fetchedAt;

  return (
    <ScreenContainer>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-snow-text">Alerts</h1>
          <div className="flex items-center gap-3">
            {fetchedAt && (
              <span className="text-[10px] text-snow-text-muted">
                {formatFetchedAt(fetchedAt)}
              </span>
            )}
            <Link
              href="/alerts/settings"
              className="text-snow-text-muted hover:text-snow-text transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-snow-surface-raised" />
            ))}
          </div>
        )}

        {!loading && activeAlerts.length === 0 && dismissedAlerts.length === 0 && (
          <div className="text-center py-12 text-sm text-snow-text-muted">
            No alerts yet. We&apos;ll notify you when powder is incoming.
          </div>
        )}

        {!loading && (
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={dismissAlert}
              />
            ))}
          </div>
        )}

        {!loading && dismissedAlerts.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">Dismissed</h2>
            <div className="space-y-1.5 opacity-40">
              {dismissedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-snow-surface-raised rounded-xl px-3 py-2.5 text-xs text-snow-text-muted"
                >
                  {alert.resort_name} — {alert.snowfall}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
