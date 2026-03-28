import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyTotal } from "../../types/stats";

interface DailyBarChartProps {
  data: DailyTotal[];
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    dateLabel: d.date.slice(5), // "MM-DD"
  }));

  const barKeys = getComputedStyle(document.documentElement)
    .getPropertyValue("--th-bar-keys").trim() || "#7c3aed";
  const barClicks = getComputedStyle(document.documentElement)
    .getPropertyValue("--th-bar-clicks").trim() || "#3b82f6";
  const bgCard = getComputedStyle(document.documentElement)
    .getPropertyValue("--th-bg-card").trim() || "#111122";
  const border = getComputedStyle(document.documentElement)
    .getPropertyValue("--th-border").trim() || "#1e1e3a";
  const accentLight = getComputedStyle(document.documentElement)
    .getPropertyValue("--th-accent-light").trim() || "#c084fc";

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={border} />
        <XAxis dataKey="dateLabel" tick={{ fill: "#64748b", fontSize: 11 }} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 8 }}
          labelStyle={{ color: accentLight }}
          itemStyle={{ color: "#e2e8f0" }}
        />
        <Bar dataKey="total_keypresses" name="Keys"   fill={barKeys}   radius={[4, 4, 0, 0]} />
        <Bar dataKey="total_clicks"     name="Clicks" fill={barClicks} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
