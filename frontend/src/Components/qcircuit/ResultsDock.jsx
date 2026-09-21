import React, { useEffect } from 'react';
import { useCircuit } from '../../lib/circuitStore';
import ExecutionResultsModal from '../ExecutionResultsModal';

export default function ResultsDock() {
  const { state, dispatch } = useCircuit();

  // Ensure modal is closed when navigating away from Circuit Studio
  useEffect(() => {
    return () => {
      dispatch({ type: 'SET_EXECUTION_MODAL_OPEN', open: false });
    };
  }, [dispatch]);

  if (!state.simulationResult) return null;

  return (
    <ExecutionResultsModal
      isOpen={Boolean(state.executionModalOpen)}
      onClose={() => dispatch({ type: 'SET_EXECUTION_MODAL_OPEN', open: false })}
      result={state.simulationResult}
    />
  );
}

