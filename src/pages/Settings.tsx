import { useEffect, useRef, useState } from "react";
import {
  getAutostartEnabled,
  setAutostart,
  resetAllData,
  getGameProcesses,
  setGameProcesses,
  resetGameProcesses,
} from "../lib/tauri";
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
  const [gameProcesses, setGameProcessesState] = useState<string[]>([]);
  const [newProcess, setNewProcess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAutostartEnabled().then(setAutostartState).catch(console.error);
    getGameProcesses().then(setGameProcessesState).catch(console.error);
  }, []);

  const addProcess = async () => {
    const trimmed = newProcess.trim().toLowerCase();
    if (!trimmed) return;
    const name = trimmed.endsWith(".exe") ? trimmed : trimmed + ".exe";
    if (gameProcesses.includes(name)) { setNewProcess(""); return; }
    const updated = [...gameProcesses, name];
    try {
      await setGameProcesses(updated);
      setGameProcessesState(updated);
      setNewProcess("");
      inputRef.current?.focus();
    } catch (e) { setStatusMsg("Failed: " + e); }
  };

  const removeProcess = async (proc: string) => {
    const updated = gameProcesses.filter(p => p !== proc);
    try {
      await setGameProcesses(updated);
      setGameProcessesState(updated);
    } catch (e) { setStatusMsg("Failed: " + e); }
  };

  const handleResetProcesses = async () => {
    try {
      const defaults = await resetGameProcesses();
      setGameProcessesState(defaults);
      setStatusMsg("Game process list reset to defaults.");
      setTimeout(() => setStatusMsg(""), 2500);
    } catch (e) { setStatusMsg("Failed: " + e); }
  };

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

      {/* Game Mode — process-based auto-pause */}
      <div className="bg-[var(--th-bg-card)] border border-[var(--th-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium text-white">Game Mode</div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30 leading-none">
            AUTO-PAUSE
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Tracking pauses automatically when one of these processes is the active window —
          no matter if it's fullscreen or windowed.{" "}
          <code className="text-slate-300 bg-white/5 px-1 rounded">javaw.exe</code> covers Minecraft Java.
        </p>

        {/* Process chips */}
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
          {gameProcesses.length === 0 && (
            <span className="text-xs text-slate-500 italic">No processes — fullscreen detection still active.</span>
          )}
          {gameProcesses.map((proc) => (
            <div
              key={proc}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs"
              style={{
                background: "var(--th-bg-surface)",
                borderColor: "var(--th-border)",
                color: "#cbd5e1",
              }}
            >
              <span className="font-mono">{proc}</span>
              <button
                onClick={() => removeProcess(proc)}
                className="ml-1 text-slate-500 hover:text-red-400 transition-colors leading-none"
                title={`Remove ${proc}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add input */}
        <div className="flex gap-2 mb-2">
          <input
            ref={inputRef}
            value={newProcess}
            onChange={(e) => setNewProcess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProcess()}
            placeholder="game.exe"
            className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white outline-none transition-colors"
            style={{
              background: "var(--th-bg-surface)",
              border: "1px solid var(--th-border)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--th-accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--th-border)")
            }
          />
          <button
            onClick={addProcess}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: "var(--th-accent)" }}
          >
            Add
          </button>
        </div>
        <button
          onClick={handleResetProcesses}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Reset to defaults
        </button>
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
        <div>Saros Keyboard Tracker v0.5.1</div>
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
