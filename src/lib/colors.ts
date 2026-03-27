export function getHeatColor(normalized: number): string {
  if (normalized === 0) return "rgb(20, 20, 35)";
  if (normalized < 0.05) return "rgb(25, 30, 60)";
  if (normalized < 0.15) return "rgb(35, 50, 120)";
  if (normalized < 0.3) return "rgb(55, 85, 190)";
  if (normalized < 0.5) return "rgb(100, 65, 210)";
  if (normalized < 0.7) return "rgb(160, 45, 225)";
  if (normalized < 0.9) return "rgb(200, 60, 240)";
  return "rgb(230, 120, 255)";
}

export function getGlowStyle(normalized: number): string {
  if (normalized < 0.05) return "none";
  const intensity = Math.round(normalized * 28);
  const color = getHeatColor(normalized);
  return `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}40`;
}

export function normalizeKeyStats(stats: { key_name: string; count: number }[]): Map<string, number> {
  const max = Math.max(...stats.map((s) => s.count), 1);
  return new Map(stats.map((s) => [s.key_name, s.count / max]));
}
