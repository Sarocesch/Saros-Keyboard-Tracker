import { getHeatColor, getGlowStyle } from "../../lib/colors";
import { KEY_UNIT_PX, KEY_GAP_PX } from "../../lib/keymap";
import type { KeyDef } from "../../lib/keymap";
import type { Theme } from "../../context/ThemeContext";

interface KeyCapProps {
  keyDef: KeyDef;
  normalizedValue: number;
  count: number;
  theme?: Theme;
}

export function KeyCap({ keyDef, normalizedValue, count, theme = "default" }: KeyCapProps) {
  const bg = getHeatColor(normalizedValue, theme);
  const glow = getGlowStyle(normalizedValue, theme);
  const width = keyDef.widthUnits * KEY_UNIT_PX + (keyDef.widthUnits - 1) * KEY_GAP_PX;

  return (
    <div
      title={`${keyDef.label}: ${count.toLocaleString()} presses`}
      className="relative rounded flex items-center justify-center text-xs font-mono font-bold cursor-default border border-white/10 transition-all duration-700"
      style={{
        backgroundColor: bg,
        boxShadow: normalizedValue > 0.05 ? glow : undefined,
        width: `${width}px`,
        height: `${KEY_UNIT_PX}px`,
        minWidth: `${width}px`,
      }}
    >
      <span className="text-white/90 drop-shadow text-[11px]">{keyDef.label}</span>
      {count > 0 && (
        <span className="absolute bottom-0.5 right-1 text-[8px] text-white/40 font-sans leading-none">
          {count > 9999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </div>
  );
}
