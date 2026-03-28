import type { Theme } from "../context/ThemeContext";

const defaultColors = [
  "rgb(20, 20, 35)",
  "rgb(25, 30, 60)",
  "rgb(35, 50, 120)",
  "rgb(55, 85, 190)",
  "rgb(100, 65, 210)",
  "rgb(160, 45, 225)",
  "rgb(200, 60, 240)",
  "rgb(230, 120, 255)",
];

const sarosColors = [
  "rgb(25, 10, 0)",
  "rgb(50, 22, 0)",
  "rgb(100, 42, 0)",
  "rgb(155, 62, 5)",
  "rgb(195, 80, 10)",
  "rgb(220, 105, 20)",
  "rgb(240, 140, 40)",
  "rgb(255, 195, 80)",
];

function getColors(theme: Theme) {
  return theme === "saros" ? sarosColors : defaultColors;
}

export function getHeatColor(normalized: number, theme: Theme = "default"): string {
  const c = getColors(theme);
  if (normalized === 0)    return c[0];
  if (normalized < 0.05)  return c[1];
  if (normalized < 0.15)  return c[2];
  if (normalized < 0.3)   return c[3];
  if (normalized < 0.5)   return c[4];
  if (normalized < 0.7)   return c[5];
  if (normalized < 0.9)   return c[6];
  return c[7];
}

export function getGlowStyle(normalized: number, theme: Theme = "default"): string {
  if (normalized < 0.05) return "none";
  const intensity = Math.round(normalized * 28);
  const color = getHeatColor(normalized, theme);
  return `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}40`;
}

export function normalizeKeyStats(stats: { key_name: string; count: number }[]): Map<string, number> {
  const max = Math.max(...stats.map((s) => s.count), 1);
  return new Map(stats.map((s) => [s.key_name, s.count / max]));
}
