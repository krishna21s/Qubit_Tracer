import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Router } from 'react-router-dom';
import Home from './Pages/Home';
import QuantumBotAssistant from './Components/QuantumBotAssistant';
function App() {

  return (<>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/chatbot" element={<QuantumBotAssistant />} />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
