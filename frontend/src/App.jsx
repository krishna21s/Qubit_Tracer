import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
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
import ApplicationsPage from "./Pages/ApplicationsPage";
import MaterialsDiscoveryPage from "./Pages/MaterialsDiscoveryPage";
import QCircuitStudioPage from "./Pages/QCircuitStudioPage";

import GeminiFrameOverlay from "./Components/qvision/GeminiFrameOverlay";
import GlobalVisualAssist from "./Components/qvision/GlobalVisualAssist";
import { useVisualAssist } from "./context/VisualAssistContext";

import { ColorModeProvider, ColorModeContext } from "./theme";
import { TemplateProvider } from "./context/TemplateContext";

import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--qt-surface, #0d1117)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

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
    <ColorModeProvider>
      <ColorModeContext.Consumer>
        {(colorModeApi) => (
          <TemplateProvider colorModeApi={colorModeApi}>
            <>
              {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

              {isVisionActive && <GeminiFrameOverlay />}

              <BrowserRouter>
                <SimulationProvider>
                  <QLiveProvider>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      
                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute />}>
                        <Route element={<NewDashboard />}>
                          <Route path="/" element={null} />
                          <Route path="/profile" element={null} />
                          <Route path="/algohub" element={null} />
                          <Route path="/qcircuit" element={null} />
                          <Route path="/inspector" element={null} />

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
                          <Route path="/applications" element={<ApplicationsPage />} />
                          <Route path="/applications/materials-discovery" element={<MaterialsDiscoveryPage />} />
                        </Route>
                      </Route>
                    </Routes>
                  </QLiveProvider>
                </SimulationProvider>
              </BrowserRouter>

              <GlobalVisualAssist />
            </>
          </TemplateProvider>
        )}
      </ColorModeContext.Consumer>
    </ColorModeProvider>
  );
}

export default App;
