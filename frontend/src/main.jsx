import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.js";
// import './index.css'
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";


import { VisualAssistProvider } from "./context/VisualAssistContext";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <VisualAssistProvider>
        <App />
      </VisualAssistProvider>
    </AuthProvider>
  </StrictMode>
);
