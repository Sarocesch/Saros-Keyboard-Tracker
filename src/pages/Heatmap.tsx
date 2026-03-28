import { useState } from "react";
import { useKeyStats } from "../hooks/useStats";
import { KeyboardLayout } from "../components/heatmap/KeyboardLayout";
import { KEYBOARD_LAYOUT } from "../lib/keymap";

const RDEV_TO_LABEL: Record<string, string> = {
  // Auto-generated from KEYBOARD_LAYOUT
  ...Object.fromEntries(KEYBOARD_LAYOUT.map((k) => [k.rdevName, k.label])),

  // Function row
  Escape: "Esc", F1: "F1", F2: "F2", F3: "F3", F4: "F4",
  F5: "F5", F6: "F6", F7: "F7", F8: "F8", F9: "F9",
  F10: "F10", F11: "F11", F12: "F12",

  // Navigation cluster
  PrintScreen: "PrtSc", ScrollLock: "ScrLk", Pause: "Pause",
  Insert: "Insert", Home: "Home", PageUp: "PgUp",
  Delete: "Delete", End: "End", PageDown: "PgDn",

  // Arrow keys
  UpArrow: "↑", DownArrow: "↓", LeftArrow: "←", RightArrow: "→",

  // Numpad
  NumLock: "NumLk",
  Kp0: "Num 0", Kp1: "Num 1", Kp2: "Num 2", Kp3: "Num 3",
  Kp4: "Num 4", Kp5: "Num 5", Kp6: "Num 6", Kp7: "Num 7",
  Kp8: "Num 8", Kp9: "Num 9",
  KpMinus: "Num -", KpPlus: "Num +",
  KpMultiply: "Num *", KpDivide: "Num /",
  KpDecimal: "Num .", KpReturn: "Num Enter",

  // Media / extra
  VolumeUp: "Vol ↑", VolumeDown: "Vol ↓", VolumeMute: "Mute",
  MediaPlay: "▶ Play", MediaStop: "■ Stop",
  MediaNextTrack: "⏭", MediaPrevTrack: "⏮",
};

/** Turn "Unknown(42)" → "Unknown #42", leave everything else as-is */
function keyLabel(rdevName: string): string {
  if (rdevName in RDEV_TO_LABEL) return RDEV_TO_LABEL[rdevName];
  const m = rdevName.match(/^Unknown\((\d+)\)$/);
  if (m) return `Unknown #${m[1]}`;
  return rdevName;
}

function todayStr() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
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
          className="bg-[var(--th-bg-card)] border border-[var(--th-border)] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--th-accent)]"
        />
      </div>

      {topKey && (
        <div className="text-sm text-slate-400">
          Most pressed: <span className="text-[var(--th-accent-light)] font-bold">{keyLabel(topKey.key_name)}</span>{" "}
          ({topKey.count.toLocaleString()}×)
        </div>
      )}

      <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-6 overflow-x-auto">
        <KeyboardLayout stats={stats} />
      </div>

      {stats.length > 0 && (
        <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3">All Keys ({stats.length})</h2>
          <div className="flex flex-col gap-2">
            {stats.map((k) => (
              <div key={k.key_name} className="flex items-center gap-3">
                <span className="w-24 text-xs font-mono text-slate-300 truncate">
                  {keyLabel(k.key_name)}
                </span>
                <div className="flex-1 bg-[#1e1e3a] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--th-grad-from)] to-[var(--th-grad-to)] rounded-full transition-all duration-500"
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
