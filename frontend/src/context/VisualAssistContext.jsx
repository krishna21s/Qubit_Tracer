import React, { createContext, useContext, useState } from "react";

const VisualAssistContext = createContext();

export function VisualAssistProvider({ children }) {
  const [isVisionActive, setIsVisionActive] = useState(false);

  return (
    <VisualAssistContext.Provider value={{ isVisionActive, setIsVisionActive }}>
      {children}
    </VisualAssistContext.Provider>
  );
}

export function useVisualAssist() {
  return useContext(VisualAssistContext);
}
