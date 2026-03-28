import { getCurrentWindow } from "@tauri-apps/api/window";
import { Keyboard } from "lucide-react";
import { useEffect, useState } from "react";

export function TitleBar() {
  const win = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    win.isMaximized().then(setIsMaximized);
    const unlisten = win.onResized(() => {
      win.isMaximized().then(setIsMaximized);
    });
    return () => { unlisten.then(f => f()); };
  }, []);

  const toggleMaximize = () => {
    if (isMaximized) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-[var(--th-bg-surface)] border-b border-[var(--th-border)] flex items-center justify-between px-4 select-none shrink-0"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <Keyboard size={16} style={{ color: "var(--th-accent-muted)" }} />
        <span className="text-sm font-semibold text-white">Saros Keyboard Tracker</span>
      </div>
      <div className="flex items-center gap-1">
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
