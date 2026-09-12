import React, { useState, useEffect } from 'react';
import { useCircuit } from '../../lib/circuitStore';
import ExecutionResultsModal from '../ExecutionResultsModal';

export default function ResultsDock() {
  const { state } = useCircuit();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.simulationResult) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [state.simulationResult]);

  if (!state.simulationResult) return null;

  return (
    <ExecutionResultsModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      result={state.simulationResult}
    />
  );
}
