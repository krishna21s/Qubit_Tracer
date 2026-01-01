import React from "react";
import { ColorModeProvider, ColorModeContext } from "../theme";
import { TemplateProvider } from "../context/TemplateContext";
import MaterialsDiscoveryContent from "../Components/applications/materials-discovery/MaterialsDiscoveryContent";

export default function MaterialsDiscoveryPage() {
  return (
    <ColorModeProvider>
      <ColorModeContext.Consumer>
        {(colorModeApi) => (
          <TemplateProvider colorModeApi={colorModeApi}>
            <MaterialsDiscoveryContent />
          </TemplateProvider>
        )}
      </ColorModeContext.Consumer>
    </ColorModeProvider>
  );
}
