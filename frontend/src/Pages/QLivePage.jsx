import React from 'react';
import { Box } from '@mui/material';
import QLiveMissionControlContent from '../Components/qlive/QLiveMissionControlContent';

export default function QLivePage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <QLiveMissionControlContent />
    </Box>
  );
}
