interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  color?: "blue" | "purple" | "pink" | "green";
}

const colorMap = {
  blue:   "from-blue-900/40 to-blue-800/20 border-blue-500/30 text-blue-400",
  purple: "from-purple-900/40 to-purple-800/20 border-purple-500/30 text-purple-400",
  pink:   "from-pink-900/40 to-pink-800/20 border-pink-500/30 text-pink-400",
  green:  "from-green-900/40 to-green-800/20 border-green-500/30 text-green-400",
};

export function StatCard({ label, value, icon, color = "purple" }: StatCardProps) {
  const classes = colorMap[color];
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
