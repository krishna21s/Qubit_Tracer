import React from 'react';
import DashboardLayout from './DashboardLayout';
import { ColorModeProvider } from '../theme';
// NOTE:
// App.jsx already wraps the whole router tree with <SimulationProvider>.
// To avoid creating a second, isolated context instance (which would break shared state),
// we REMOVED the nested SimulationProvider that was previously here.
// No UI or logic changes otherwise.

export default function NewDashboard() {
  return (
    <ColorModeProvider>
      <DashboardLayout />
    </ColorModeProvider>
  );
}