import { useEffect, useState } from "react";
import { getAutostartEnabled, setAutostart, resetAllData } from "../lib/tauri";
import { Toggle } from "../components/ui/Toggle";
import { useTheme } from "../context/ThemeContext";
import type { Theme } from "../context/ThemeContext";

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  preview: { bg: string; accent: string; surface: string };
}

const THEMES: ThemeOption[] = [
  {
    id: "default",
    name: "Default",
    description: "Deep purple & neon pink",
    preview: { bg: "#0a0a14", accent: "#7c3aed", surface: "#111122" },
  },
  {
    id: "saros",
    name: "Saros",
    description: "Burning orange & amber",
    preview: { bg: "#0f0800", accent: "#c2410c", surface: "#1c0f00" },
  },
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [autostart, setAutostartState] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    getAutostartEnabled().then(setAutostartState).catch(console.error);
  }, []);

  const handleAutostart = async (enabled: boolean) => {
    try {
      await setAutostart(enabled);
      setAutostartState(enabled);
      setStatusMsg(enabled ? "Autostart enabled" : "Autostart disabled");
      setTimeout(() => setStatusMsg(""), 2500);
    } catch (e) {
      setStatusMsg("Failed: " + e);
    }
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    try {
      await resetAllData();
      setResetConfirm(false);
      setStatusMsg("All data has been reset.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setStatusMsg("Failed: " + e);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure Saros Keyboard Tracker</p>
      </div>

      {statusMsg && (
        <div
          className="border rounded-lg px-4 py-3 text-sm"
          style={{
            background: "var(--th-active-bg)",
            borderColor: "var(--th-active-border)",
            color: "var(--th-accent-light)",
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Theme switcher */}
      <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-5">
        <div className="text-sm font-medium text-white mb-1">Theme</div>
        <div className="text-xs text-slate-400 mb-4">Choose your color scheme</div>
        <div className="flex gap-3">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex-1 rounded-xl p-3 border-2 transition-all duration-200 text-left cursor-pointer"
                style={{
                  background: t.preview.bg,
                  borderColor: isActive ? t.preview.accent : "#ffffff18",
                  boxShadow: isActive ? `0 0 16px ${t.preview.accent}55` : undefined,
                }}
              >
                {/* Mini preview bars */}
                <div
                  className="w-full h-8 rounded-lg mb-2 flex items-center gap-1 px-2"
                  style={{ background: t.preview.surface }}
                >
                  {[0.4, 0.65, 0.9].map((op, i) => (
                    <div
                      key={i}
                      className="flex-1 h-3 rounded"
                      style={{ background: t.preview.accent, opacity: op }}
                    />
                  ))}
                </div>
                <div className="text-xs font-semibold text-white">{t.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t.description}</div>
                {isActive && (
                  <div
                    className="text-[10px] font-bold mt-1"
                    style={{ color: t.preview.accent }}
                  >
                    ✓ Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl divide-y divide-[var(--th-border)]">
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Start with Windows</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Launch automatically when you log in
            </div>
          </div>
          <Toggle checked={autostart} onChange={handleAutostart} />
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Close to Tray</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Clicking ✕ hides the app — it keeps tracking
            </div>
          </div>
          <div className="text-xs font-mono" style={{ color: "var(--th-accent-muted)" }}>
            Always on
          </div>
        </div>
      </div>

      <div className="bg-[var(--th-bg-card)] border border-red-900/30 rounded-xl p-5">
        <h2 className="text-sm font-medium text-red-400 mb-1">Danger Zone</h2>
        <p className="text-xs text-slate-400 mb-4">
          This will permanently delete all tracked data. There is no undo.
        </p>
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            resetConfirm
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "hover:bg-red-900/30 text-red-400 border border-red-900/40"
          }`}
          style={!resetConfirm ? { background: "var(--th-bg-card)" } : {}}
        >
          {resetConfirm ? "Click again to confirm reset" : "Reset All Data"}
        </button>
        {resetConfirm && (
          <button
            onClick={() => setResetConfirm(false)}
            className="ml-3 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-5 text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-400 mb-2">About</div>
        <div>Saros Keyboard Tracker v0.4.0</div>
        <div>All data is stored locally on your machine.</div>
        <div>No network connections are made.</div>
        <div className="pt-1">
          <a
            href="https://github.com/Sarocesch/saros-keyboard-tracker"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--th-accent-muted)" }}
            className="hover:underline"
          >
            GitHub — Open Source
          </a>
        </div>
      </div>
    </div>
  );
}
