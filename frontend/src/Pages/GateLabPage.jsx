import React from 'react';
import { Box } from '@mui/material';
import GateLabPanel from '../Components/gate-lab/GateLabPanel';

export default function GateLabPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', border: '1px solid var(--qt-border)', borderRadius: 2, background: 'var(--qt-surface-glass, rgba(10,20,30,0.45))' }}>
      <GateLabPanel />
    </Box>
  );
}