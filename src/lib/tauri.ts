import { invoke } from "@tauri-apps/api/core";
import type { TodayStats, KeyCount, MouseCount, DailyTotal } from "../types/stats";

export const getTodayStats = () => invoke<TodayStats>("get_today_stats");
export const getKeyStats = (date: string) => invoke<KeyCount[]>("get_key_stats", { date });
export const getMouseStats = (date: string) => invoke<MouseCount[]>("get_mouse_stats", { date });
export const getDailyTotals = (days: number) => invoke<DailyTotal[]>("get_daily_totals", { days });
export const setAutostart = (enabled: boolean) => invoke<void>("set_autostart", { enabled });
export const getAutostartEnabled = () => invoke<boolean>("get_autostart_enabled");
export const resetAllData = () => invoke<void>("reset_all_data");
export type TrackingStatus = { manual: boolean; game: boolean };
export const getTrackingPaused = () => invoke<TrackingStatus>("get_tracking_paused");
export const setTrackingPaused = (paused: boolean) => invoke<void>("set_tracking_paused", { paused });
export const getGameProcesses = () => invoke<string[]>("get_game_processes");
export const setGameProcesses = (processes: string[]) => invoke<void>("set_game_processes", { processes });
export const resetGameProcesses = () => invoke<string[]>("reset_game_processes");
