"use client";

import Link from "next/link";
import { Snowflake, Clock, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PowderAlert } from "@/types/alert";

interface AlertCardProps {
  alert: PowderAlert;
  onDismiss: (id: string) => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  return (
    <div className="rounded-xl bg-snow-surface-raised border border-snow-border p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-snow-text">{alert.resort_name}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-snow-alert/15 text-snow-alert uppercase tracking-wider">
          Alert
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-snow-text-muted">
        <span className="flex items-center gap-1.5">
          <Snowflake className="w-3.5 h-3.5 text-snow-primary" />
          {alert.snowfall}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {alert.timing}
        </span>
        <span className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5" />
          {alert.travel}
        </span>
      </div>

      <div className="flex gap-2">
        <Link href={`/storm/${alert.storm_id}`} className="flex-1">
          <Button variant="primary" fullWidth size="sm">
            View Storm
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => onDismiss(alert.id)}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
