import { useEffect, useState } from "react";
import { getAutostartEnabled, setAutostart, resetAllData } from "../lib/tauri";
import { Toggle } from "../components/ui/Toggle";

export function Settings() {
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
        <div className="bg-purple-900/30 border border-purple-500/30 text-purple-200 rounded-lg px-4 py-3 text-sm">
          {statusMsg}
        </div>
      )}

      <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl divide-y divide-[#1e1e3a]">
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
          <div className="text-xs text-purple-400 font-mono">Always on</div>
        </div>
      </div>

      <div className="bg-[#111122] border border-red-900/30 rounded-xl p-5">
        <h2 className="text-sm font-medium text-red-400 mb-1">Danger Zone</h2>
        <p className="text-xs text-slate-400 mb-4">
          This will permanently delete all tracked data. There is no undo.
        </p>
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            resetConfirm
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-[#1e1e3a] hover:bg-red-900/30 text-red-400 border border-red-900/40"
          }`}
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

      <div className="bg-[#111122] border border-[#1e1e3a] rounded-xl p-5 text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-400 mb-2">About</div>
        <div>Saros Keyboard Tracker v0.1.0</div>
        <div>All data is stored locally on your machine.</div>
        <div>No network connections are made.</div>
        <div className="pt-1">
          <a
            href="https://github.com/Sarocesch/saros-keyboard-tracker"
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:underline"
          >
            GitHub — Open Source (MIT)
          </a>
        </div>
      </div>
    </div>
  );
}
