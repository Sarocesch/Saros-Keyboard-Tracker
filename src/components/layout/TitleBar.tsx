import { getCurrentWindow } from "@tauri-apps/api/window";
import { Keyboard } from "lucide-react";

export function TitleBar() {
  const win = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-[#0d0d1a] border-b border-[#1e1e3a] flex items-center justify-between px-4 select-none shrink-0"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <Keyboard size={16} className="text-purple-400" />
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
          onClick={() => win.hide()}
          className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Hide to tray"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
