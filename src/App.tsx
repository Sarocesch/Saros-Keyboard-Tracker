import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { TitleBar } from "./components/layout/TitleBar";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Heatmap } from "./pages/Heatmap";
import { MouseStats } from "./pages/MouseStats";
import { DailyReport } from "./pages/DailyReport";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-[#0a0a14] text-white overflow-hidden">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/heatmap"  element={<Heatmap />} />
              <Route path="/mouse"    element={<MouseStats />} />
              <Route path="/report"   element={<DailyReport />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
