import React from 'react';
import { Box } from '@mui/material';
import OneQStudioPanel from '../Components/oneq/OneQStudioPanel';

export default function OneQStudioPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', border: '1px solid var(--qt-border)', borderRadius: 2, background: 'var(--qt-surface-glass, rgba(10,20,30,0.45))' }}>
      <OneQStudioPanel />
    </Box>
  );
}