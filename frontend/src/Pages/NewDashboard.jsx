import React from 'react';
import DashboardLayout from './DashboardLayout';
import { ColorModeProvider, ColorModeContext } from '../theme';
import { TemplateProvider } from '../context/TemplateContext';

// Step 1: Wrap DashboardLayout with TemplateProvider (inside ColorModeProvider)
// so we can access colorMode to sync light/dark when applying templates.
export default function NewDashboard() {
  return (
    <ColorModeProvider>
      <ColorModeContext.Consumer>
        {colorModeApi => (
          <TemplateProvider colorModeApi={colorModeApi}>
            <DashboardLayout />
          </TemplateProvider>
        )}
      </ColorModeContext.Consumer>
    </ColorModeProvider>
  );
}