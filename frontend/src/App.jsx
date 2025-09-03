import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Router } from 'react-router-dom';
import Home from './Pages/Home';
import DebuggerPage from './pages/DebuggerPage';
import QuantumBotAssistant from './Components/QuantumBotAssistant';
import { SimulationProvider } from './context/SimulationContext';

function App() {

  return (<>
    <BrowserRouter>

      <SimulationProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<QuantumBotAssistant />} />
          <Route path="/debugger" element={<DebuggerPage />} />
        </Routes>
      </SimulationProvider>

    </BrowserRouter>
  </>
  );
}

export default App;
