interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  color?: "accent" | "blue" | "pink" | "green";
}

const staticColorMap = {
  blue:  "from-blue-900/40 to-blue-800/20 border-blue-500/30",
  pink:  "from-pink-900/40 to-pink-800/20 border-pink-500/30",
  green: "from-green-900/40 to-green-800/20 border-green-500/30",
};

export function StatCard({ label, value, icon, color = "accent" }: StatCardProps) {
  if (color === "accent") {
    return (
      <div
        className="border rounded-xl p-5 flex flex-col gap-2"
        style={{
          background: `linear-gradient(to bottom right, var(--th-accent-dim), transparent)`,
          borderColor: "var(--th-active-border)",
        }}
      >
        <div className="text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </div>
        <div className="text-3xl font-bold text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>
    );
  }

  const classes = staticColorMap[color];
  return (
    <div className={`bg-gradient-to-br ${classes} border rounded-xl p-5 flex flex-col gap-2`}>
      <div className="text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="text-3xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
