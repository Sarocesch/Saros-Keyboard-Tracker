import { getCurrentWindow } from "@tauri-apps/api/window";
import { Keyboard } from "lucide-react";
import { useEffect, useState } from "react";
import { getTrackingPaused, setTrackingPaused, type TrackingStatus } from "../../lib/tauri";

export function TitleBar() {
  const win = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);
  const [status, setStatus] = useState<TrackingStatus>({ manual: false, game: false });

  useEffect(() => {
    win.isMaximized().then(setIsMaximized);
    const unlisten = win.onResized(() => {
      win.isMaximized().then(setIsMaximized);
    });

    // Initial fetch
    getTrackingPaused().then(setStatus).catch(() => {});

    // Poll every 2 s so the UI reflects game-mode auto-pause changes
    const interval = setInterval(() => {
      getTrackingPaused().then(setStatus).catch(() => {});
    }, 2000);

    return () => {
      unlisten.then(f => f());
      clearInterval(interval);
    };
  }, []);

  const toggleMaximize = () => {
    if (isMaximized) win.unmaximize();
    else win.maximize();
  };

  const togglePause = async () => {
    const next = !status.manual;
    await setTrackingPaused(next);
    setStatus(s => ({ ...s, manual: next }));
  };

  const anyPaused = status.manual || status.game;

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-[var(--th-bg-surface)] border-b border-[var(--th-border)] flex items-center justify-between px-4 select-none shrink-0"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <Keyboard size={16} style={{ color: "var(--th-accent-muted)" }} />
        <span className="text-sm font-semibold text-white">Saros Keyboard Tracker</span>

        {/* Game-mode badge (auto-pause) — shown above manual badge */}
        {status.game && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30 leading-none">
            GAME MODE
          </span>
        )}

        {/* Manual pause badge — only shown when user paused and NOT in game mode */}
        {status.manual && !status.game && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 leading-none">
            PAUSED
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Manual pause / resume button.
            Disabled while game-mode is active — the hook is already paused. */}
        <button
          onClick={togglePause}
          disabled={status.game}
          title={
            status.game
              ? "Auto-paused — game detected"
              : status.manual
              ? "Resume tracking"
              : "Pause tracking (use when gaming)"
          }
          className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors ${
            status.game
              ? "opacity-30 cursor-not-allowed text-slate-400"
              : anyPaused
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "hover:bg-white/10 text-slate-400 hover:text-white"
          }`}
          aria-label={status.manual ? "Resume tracking" : "Pause tracking"}
        >
          {status.manual ? "▶" : "⏸"}
        </button>

        <button
          onClick={() => win.minimize()}
          className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Minimize"
        >
          ─
        </button>
        <button
          onClick={toggleMaximize}
          className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xs"
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? "❐" : "□"}
        </button>
        <button
          onClick={() => win.hide()}
          className="w-7 h-7 rounded hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
          aria-label="Hide to tray"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
