export interface TodayStats {
  total_keypresses: number;
  total_clicks: number;
  left_clicks: number;
  right_clicks: number;
  middle_clicks: number;
  date: string;
}

export interface KeyCount {
  key_name: string;
  count: number;
}

export interface MouseCount {
  button: string;
  count: number;
}

export interface DailyTotal {
  date: string;
  total_keypresses: number;
  total_clicks: number;
}
