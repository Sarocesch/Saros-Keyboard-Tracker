import { useEffect, useState } from "react";
import { getTodayStats, getKeyStats, getMouseStats, getDailyTotals } from "../lib/tauri";
import type { TodayStats, KeyCount, MouseCount, DailyTotal } from "../types/stats";

export function useTodayStats(intervalMs = 2000) {
  const [stats, setStats] = useState<TodayStats | null>(null);

  useEffect(() => {
    const fetch = () => getTodayStats().then(setStats).catch(console.error);
    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return stats;
}

export function useKeyStats(date: string) {
  const [stats, setStats] = useState<KeyCount[]>([]);

  useEffect(() => {
    if (!date) return;
    getKeyStats(date).then(setStats).catch(console.error);
  }, [date]);

  return stats;
}

export function useMouseStats(date: string) {
  const [stats, setStats] = useState<MouseCount[]>([]);

  useEffect(() => {
    if (!date) return;
    getMouseStats(date).then(setStats).catch(console.error);
  }, [date]);

  return stats;
}

export function useDailyTotals(days = 30) {
  const [totals, setTotals] = useState<DailyTotal[]>([]);

  useEffect(() => {
    getDailyTotals(days).then(setTotals).catch(console.error);
    const id = setInterval(() => {
      getDailyTotals(days).then(setTotals).catch(console.error);
    }, 30000);
    return () => clearInterval(id);
  }, [days]);

  return totals;
}
