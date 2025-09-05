import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewDashboard from './Pages/NewDashboard';
import DebuggerPage from './Pages/DebuggerPage';
import Home from './Pages/Home';
import QuantumBotAssistant from './Components/QuantumBotAssistant';
import { SimulationProvider } from './context/SimulationContext';

function App() {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Routes>
          <Route path="/" element={<NewDashboard />} />
         
          <Route path="/debugger" element={<DebuggerPage />} />
          <Route path="/chatbot" element={<QuantumBotAssistant />} />
          <Route path="/legacy" element={<Home />} />
        </Routes>
      </SimulationProvider>
    </BrowserRouter>
  );
}
export default App;