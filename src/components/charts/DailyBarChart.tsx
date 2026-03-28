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
import { useTheme } from "../../context/ThemeContext";

interface DailyBarChartProps {
  data: DailyTotal[];
}

function cssVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  // Subscribe to theme so the chart re-renders when the user switches themes
  useTheme();

  const formatted = data.map((d) => ({
    ...d,
    dateLabel: d.date.slice(5), // "MM-DD"
  }));

  const barKeys    = cssVar("--th-bar-keys",     "#7c3aed");
  const barClicks  = cssVar("--th-bar-clicks",   "#3b82f6");
  const bgCard     = cssVar("--th-bg-card",      "#111122");
  const border     = cssVar("--th-border",       "#1e1e3a");
  const accentLight = cssVar("--th-accent-light","#c084fc");

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
