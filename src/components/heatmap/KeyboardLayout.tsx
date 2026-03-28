import { useMemo } from "react";
import { KEYBOARD_LAYOUT } from "../../lib/keymap";
import { normalizeKeyStats } from "../../lib/colors";
import { useTheme } from "../../context/ThemeContext";
import { KeyCap } from "./KeyCap";
import { NavCluster } from "./NavCluster";
import { NumpadLayout } from "./NumpadLayout";
import type { KeyCount } from "../../types/stats";

interface KeyboardLayoutProps {
  stats: KeyCount[];
}

export function KeyboardLayout({ stats }: KeyboardLayoutProps) {
  const { theme } = useTheme();
  const normalized = useMemo(() => normalizeKeyStats(stats), [stats]);
  const countMap = useMemo(
    () => new Map(stats.map((s) => [s.key_name, s.count])),
    [stats]
  );

  const rows = useMemo(() => {
    const map = new Map<number, typeof KEYBOARD_LAYOUT>();
    for (const key of KEYBOARD_LAYOUT) {
      if (!map.has(key.row)) map.set(key.row, []);
      map.get(key.row)!.push(key);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, []);

  return (
    <div className="flex gap-4 w-fit items-start">
      {/* Main keyboard */}
      <div className="flex flex-col gap-[3px]">
        {rows.map(([rowIdx, keys]) => (
          <div key={rowIdx} className="flex gap-[3px]">
            {keys.map((keyDef) => (
              <KeyCap
                key={keyDef.rdevName}
                keyDef={keyDef}
                normalizedValue={normalized.get(keyDef.rdevName) ?? 0}
                count={countMap.get(keyDef.rdevName) ?? 0}
                theme={theme}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Navigation cluster */}
      <NavCluster normalized={normalized} counts={countMap} theme={theme} />

      {/* Numpad */}
      <NumpadLayout normalized={normalized} counts={countMap} theme={theme} />
    </div>
  );
}
