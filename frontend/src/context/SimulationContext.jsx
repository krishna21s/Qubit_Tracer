import React, { createContext, useContext, useState, useCallback } from 'react';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [simulationResult, setSimulationResult] = useState(null);

  const updateSimulationResult = useCallback((res) => {
    setSimulationResult(res);
  }, []);

  return (
    <SimulationContext.Provider value={{ simulationResult, updateSimulationResult }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}