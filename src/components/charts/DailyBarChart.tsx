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

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
        <XAxis dataKey="dateLabel" tick={{ fill: "#64748b", fontSize: 11 }} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "#111122", border: "1px solid #1e1e3a", borderRadius: 8 }}
          labelStyle={{ color: "#c084fc" }}
          itemStyle={{ color: "#e2e8f0" }}
        />
        <Bar dataKey="total_keypresses" name="Keys"   fill="#7c3aed" radius={[4, 4, 0, 0]} />
        <Bar dataKey="total_clicks"     name="Clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
