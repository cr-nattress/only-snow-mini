export interface HourlySnowfall {
  hour: string; // e.g. "8pm", "2am"
  inches: number;
  intensity: "light" | "moderate" | "heavy";
}

export interface StormResortData {
  resort_id: string;
  resort_name: string;
  expected_snowfall: number;
  drive_minutes: number;
  powder_score: number;
  verdict: "go" | "maybe" | "skip";
  high_temp_f: number;
  low_temp_f: number;
  wind_mph: number;
}

export interface Storm {
  id: string;
  name: string;
  date_range: string; // e.g. "Feb 18-19"
  start_date: string; // ISO
  end_date: string; // ISO
  headline: string;
  best_window: string;
  road_conditions: string;
  hourly_snowfall: HourlySnowfall[];
  resort_data: StormResortData[];
}
