import { useTodayStats } from "../hooks/useStats";
import { StatCard } from "../components/stats/StatCard";

export function Dashboard() {
  const stats = useTodayStats();

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          {stats?.date ?? "Today"} — live stats update every 2s
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Keypresses"
          value={stats?.total_keypresses ?? 0}
          icon="⌨️"
          color="purple"
        />
        <StatCard
          label="Mouse Clicks"
          value={stats?.total_clicks ?? 0}
          icon="🖱️"
          color="blue"
        />
        <StatCard
          label="Left Clicks"
          value={stats?.left_clicks ?? 0}
          icon="◀"
          color="pink"
        />
        <StatCard
          label="Right Clicks"
          value={stats?.right_clicks ?? 0}
          icon="▶"
          color="green"
        />
      </div>

      <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-5">
        <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4">
          Total inputs today
        </h2>
        <div className="text-5xl font-bold text-white">
          {((stats?.total_keypresses ?? 0) + (stats?.total_clicks ?? 0)).toLocaleString()}
        </div>
        <div className="text-slate-500 text-sm mt-1">keystrokes + clicks combined</div>
      </div>
    </div>
  );
}
