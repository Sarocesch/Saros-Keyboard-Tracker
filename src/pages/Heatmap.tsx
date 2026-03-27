import { useState } from "react";
import { useKeyStats } from "../hooks/useStats";
import { KeyboardLayout } from "../components/heatmap/KeyboardLayout";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function Heatmap() {
  const [date, setDate] = useState(todayStr());
  const stats = useKeyStats(date);

  const total = stats.reduce((s, k) => s + k.count, 0);
  const topKey = stats[0];

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Keyboard Heatmap</h1>
          <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} keypresses on {date}</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#111122] border border-[#1e1e3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      {topKey && (
        <div className="text-sm text-slate-400">
          Most pressed: <span className="text-purple-300 font-bold">{topKey.key_name}</span>{" "}
          ({topKey.count.toLocaleString()}×)
        </div>
      )}

      <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-6 overflow-x-auto">
        <KeyboardLayout stats={stats} />
      </div>

      {stats.length > 0 && (
        <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3">Top 10 Keys</h2>
          <div className="flex flex-col gap-2">
            {stats.slice(0, 10).map((k) => (
              <div key={k.key_name} className="flex items-center gap-3">
                <span className="w-20 text-xs font-mono text-slate-300 truncate">{k.key_name}</span>
                <div className="flex-1 bg-[#1e1e3a] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(k.count / (stats[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-14 text-right">{k.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
