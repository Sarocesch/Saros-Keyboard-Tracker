import { getHeatColor, getGlowStyle } from "../../lib/colors";
import type { Theme } from "../../context/ThemeContext";

interface GridKeyProps {
  label: string;
  normalizedValue: number;
  count: number;
  theme: Theme;
  /** Extra inline styles — use for grid-area / grid-column / grid-row placement */
  style?: React.CSSProperties;
  small?: boolean;
}

export function GridKey({
  label,
  normalizedValue,
  count,
  theme,
  style,
  small,
}: GridKeyProps) {
  const bg   = getHeatColor(normalizedValue, theme);
  const glow = getGlowStyle(normalizedValue, theme);

  return (
    <div
      title={`${label}: ${count.toLocaleString()} presses`}
      className="relative rounded flex items-center justify-center font-mono font-bold cursor-default border border-white/10 transition-all duration-700 select-none"
      style={{
        backgroundColor: bg,
        boxShadow: normalizedValue > 0.05 ? glow : undefined,
        fontSize: small ? "9px" : "11px",
        ...style,
      }}
    >
      <span className="text-white/90 drop-shadow leading-none">{label}</span>
      {count > 0 && (
        <span className="absolute bottom-0.5 right-1 text-[8px] text-white/40 font-sans leading-none">
          {count > 9999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </div>
  );
}
