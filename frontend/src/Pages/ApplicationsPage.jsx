import React from "react";
import { ColorModeProvider, ColorModeContext } from "../theme";
import { TemplateProvider } from "../context/TemplateContext";
import ApplicationsContent from "../Components/applications/ApplicationsContent";

export default function ApplicationsPage() {
  return (
    <ColorModeProvider>
      <ColorModeContext.Consumer>
        {(colorModeApi) => (
          <TemplateProvider colorModeApi={colorModeApi}>
            <ApplicationsContent />
          </TemplateProvider>
        )}
      </ColorModeContext.Consumer>
    </ColorModeProvider>
  );
}