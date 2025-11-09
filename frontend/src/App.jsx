import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewDashboard from "./Pages/NewDashboard";
import DebuggerPage from "./Pages/DebuggerPage";
import Home from "./Pages/Home";
import QuantumBotAssistant from "./Components/QuantumBotAssistant";
import { SimulationProvider } from "./context/SimulationContext";
import { QLiveProvider } from "./context/QLiveContext";
import QTalkPage from "./Components/qtalk/QTalkPage";
// NEW: SplashScreen overlay (shows once per tab until the tab is closed)
import SplashScreen from "./Components/SplashScreen";
import GamifyPage from "./Pages/GamifyPage";
import DocsPage from "./Pages/DocsPage";

import QMemoPage from "./Pages/QMemoPage"; // NEW
import GateLabPage from "./Pages/GateLabPage"; // NEW
import OneQStudioPage from "./Pages/OneQStudioPage"; // NEW
import QLivePage from "./Pages/QLivePage";

function App() {
  // Show splash only once per tab (persists across refresh; resets when tab is closed)
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("qt_splash_seen_tab");
      if (!seen) setShowSplash(true);
    } catch {
      // sessionStorage may be blocked; fail silent (no splash)
    }
  }, []);

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem("qt_splash_seen_tab", "1");
    } catch { }
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <BrowserRouter >
        <SimulationProvider>
          <QLiveProvider>
            <Routes>
              <Route path="/" element={<NewDashboard />} />
              <Route path="/debugger" element={<DebuggerPage />} />
              <Route path="/chatbot" element={<QuantumBotAssistant />} />
              <Route path="/qtalk" element={<QTalkPage />} />
              <Route path="/legacy" element={<Home />} />
              <Route path="/gamify" element={<GamifyPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/docs/:slug" element={<DocsPage />} />
              <Route path="/qmemo" element={<QMemoPage />} />
              {/* NEW routes */}
              <Route path="/gate-lab" element={<GateLabPage />} />
              <Route path="/oneq-studio" element={<OneQStudioPage />} />
              <Route path="/qlive" element={<QLivePage />} />
            </Routes>
          </QLiveProvider>
        </SimulationProvider>
      </BrowserRouter>
    </>
  );
}
export default App;
