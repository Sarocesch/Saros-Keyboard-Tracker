import { useDailyTotals } from "../hooks/useStats";
import { DailyBarChart } from "../components/charts/DailyBarChart";

export function DailyReport() {
  const totals = useDailyTotals(30);

  const totalKeys = totals.reduce((s, d) => s + d.total_keypresses, 0);
  const totalClicks = totals.reduce((s, d) => s + d.total_clicks, 0);
  const bestDay = totals.reduce(
    (best, d) =>
      d.total_keypresses + d.total_clicks > (best?.total_keypresses ?? 0) + (best?.total_clicks ?? 0)
        ? d
        : best,
    totals[0]
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Last 30 days overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">Total Keys (30d)</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">{totalKeys.toLocaleString()}</div>
        </div>
        <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">Total Clicks (30d)</div>
          <div className="text-2xl font-bold text-blue-300 mt-1">{totalClicks.toLocaleString()}</div>
        </div>
        <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">Best Day</div>
          <div className="text-2xl font-bold text-pink-300 mt-1">{bestDay?.date?.slice(5) ?? "—"}</div>
        </div>
      </div>

      <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4">
          Keys + Clicks per Day
        </h2>
        <DailyBarChart data={totals} />
      </div>

      <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3">Day-by-Day</h2>
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {[...totals].reverse().map((d) => (
            <div
              key={d.date}
              className="flex items-center justify-between py-2 border-b border-[#1e1e3a] last:border-0 text-sm"
            >
              <span className="text-slate-300 font-mono">{d.date}</span>
              <div className="flex gap-6">
                <span className="text-purple-300">{d.total_keypresses.toLocaleString()} keys</span>
                <span className="text-blue-300">{d.total_clicks.toLocaleString()} clicks</span>
              </div>
            </div>
          ))}
          {totals.length === 0 && (
            <p className="text-slate-500 text-sm">No data yet — start typing!</p>
          )}
        </div>
      </div>
    </div>
  );
}
