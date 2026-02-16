export interface PowderAlert {
  id: string;
  resort_name: string;
  resort_id: string;
  storm_id: string;
  snowfall: string; // e.g. "8-12\""
  timing: string; // e.g. "Snow ends 7:30am"
  best_window: string; // e.g. "8-11am tomorrow"
  travel: string; // e.g. "20 min drive"
  created_at: string; // ISO
  dismissed: boolean;
}
