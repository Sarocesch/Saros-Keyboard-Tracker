import { useState } from "react";
import { useMouseStats } from "../hooks/useStats";
import { StatCard } from "../components/stats/StatCard";

function todayStr() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
}

const BUTTON_LABELS: Record<string, string> = {
  Left:   "Left Click",
  Right:  "Right Click",
  Middle: "Middle Click",
};

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function MouseStats() {
  const [date, setDate] = useState(todayStr());
  const stats = useMouseStats(date);

  const getCount = (btn: string) => stats.find((s) => s.button === btn)?.count ?? 0;
  const total = stats.reduce((s, b) => s + b.count, 0);

  const accentDim  = cssVar("--th-accent-dim");
  const accentLight = cssVar("--th-accent-light");
  const bgCard     = cssVar("--th-bg-card");
  const border     = cssVar("--th-border");

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Mouse Stats</h1>
          <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} clicks on {date}</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[var(--th-bg-card)] border border-[var(--th-border)] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--th-accent)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Left Click"   value={getCount("Left")}   icon="◀" color="accent" />
        <StatCard label="Right Click"  value={getCount("Right")}  icon="▶" color="blue"   />
        <StatCard label="Middle Click" value={getCount("Middle")} icon="●" color="pink"   />
      </div>

      {/* Mouse visual */}
      <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-8 flex justify-center">
        <div className="relative w-32 h-48 border-2 border-slate-600 rounded-t-[50px] rounded-b-xl flex flex-col overflow-hidden">
          {/* Left button */}
          <div
            className="flex-1 border-r border-slate-600 flex items-center justify-center text-xs font-bold transition-colors duration-300"
            style={{
              background: getCount("Left") > 0 ? accentDim : bgCard,
              color: getCount("Left") > 0 ? accentLight : "#475569",
            }}
          >
            L
          </div>
          {/* Right button overlaid via flex */}
          <div className="flex flex-1">
            <div className="flex-1" />
            <div
              className="flex-1 flex items-center justify-center text-xs font-bold transition-colors duration-300"
              style={{
                background: getCount("Right") > 0 ? "#3b82f644" : bgCard,
                color: getCount("Right") > 0 ? "#93c5fd" : "#475569",
              }}
            >
              R
            </div>
          </div>
          {/* Middle scroll */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 rounded-full border border-slate-500 flex items-center justify-center text-[8px] transition-colors duration-300"
            style={{
              background: getCount("Middle") > 0 ? "#ec489944" : border,
              color: getCount("Middle") > 0 ? "#f9a8d4" : "#475569",
            }}
          >
            M
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3">All Buttons</h2>
          <div className="flex flex-col gap-2">
            {stats.map((s) => (
              <div key={s.button} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{BUTTON_LABELS[s.button] ?? s.button}</span>
                <span className="text-[var(--th-accent-light)] font-mono">{s.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
