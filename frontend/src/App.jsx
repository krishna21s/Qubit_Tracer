import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewDashboard from "./Pages/NewDashboard";
import DebuggerPage from "./Pages/DebuggerPage";
import Home from "./Pages/Home";
import QuantumBotAssistant from "./Components/QuantumBotAssistant";
import { SimulationProvider } from "./context/SimulationContext";
import { QLiveProvider } from "./context/QLiveContext";
import QTalkPage from "./Components/qtalk/QTalkPage";
import SplashScreen from "./Components/SplashScreen";
import GamifyPage from "./Pages/GamifyPage";
import DocsPage from "./Pages/DocsPage";

import QMemoPage from "./Pages/QMemoPage";
import GateLabPage from "./Pages/GateLabPage";
import OneQStudioPage from "./Pages/OneQStudioPage";
import QLivePage from "./Pages/QLivePage";

import GeminiFrameOverlay from "./Components/qvision/GeminiFrameOverlay";
import GlobalVisualAssist from "./Components/qvision/GlobalVisualAssist";
import { useVisualAssist } from "./context/VisualAssistContext";

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const { isVisionActive } = useVisualAssist();

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("qt_splash_seen_tab");
      if (!seen) setShowSplash(true);
    } catch {}
  }, []);

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem("qt_splash_seen_tab", "1");
    } catch {}
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {isVisionActive && <GeminiFrameOverlay />}

      <BrowserRouter>
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
              <Route path="/gate-lab" element={<GateLabPage />} />
              <Route path="/oneq-studio" element={<OneQStudioPage />} />
              <Route path="/qlive" element={<QLivePage />} />
              <Route path="/algohub" element={<NewDashboard />} />
            </Routes>
          </QLiveProvider>
        </SimulationProvider>
      </BrowserRouter>

      <GlobalVisualAssist />
    </>
  );
}

export default App;
