import React, { createContext, useContext, useState, useCallback } from 'react';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [simulationResult, setSimulationResult] = useState(null);

  // NEW: optional shared builder states
  const [builderWorkingQasm, setBuilderWorkingQasm] = useState('');
  const [builderSavedQasm, setBuilderSavedQasm] = useState('');

  const updateSimulationResult = useCallback((res) => {
    setSimulationResult(res);
  }, []);

  return (
    <SimulationContext.Provider value={{
      simulationResult,
      updateSimulationResult,
      builderWorkingQasm,
      setBuilderWorkingQasm,
      builderSavedQasm,
      setBuilderSavedQasm
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}