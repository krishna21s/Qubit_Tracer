import { defineConfig, createLogger } from "vite";
import react from "@vitejs/plugin-react";

// Filter out noisy ECONNREFUSED logs in terminal during backend startup
const logger = createLogger();
const originalLoggerError = logger.error;
logger.error = (msg, options) => {
  if (
    options?.error?.code === "ECONNREFUSED" ||
    options?.error?.code === "ECONNRESET" ||
    (typeof msg === "string" && (msg.includes("ECONNREFUSED") || msg.includes("ECONNRESET")))
  ) {
    return;
  }
  originalLoggerError(msg, options);
};

// Suppress ECONNREFUSED proxy errors that appear while the backend is still
// starting up. Vite's http-proxy logs every forwarding failure to the console
// by default; this handler swallows the "backend not ready yet" noise while
// still surfacing any genuinely unexpected proxy errors.
function silentProxy(extra = {}) {
  return {
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
    configure(proxy) {
      proxy.on("error", (err, _req, res) => {
        // Handle ECONNREFUSED gracefully — backend is still starting
        if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
          if (res && !res.headersSent && typeof res.writeHead === "function") {
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Backend starting up", code: err.code }));
          }
          return;
        }
        // For other unexpected errors, still log them
        console.error("[proxy error]", err.message);
        if (res && !res.headersSent && typeof res.writeHead === "function") {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Backend unavailable", detail: err.message }));
        }
      });
    },
    ...extra,
  };
}

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0 so other devices on LAN can connect
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      "/api":         silentProxy(),
      "/auth":        silentProxy(),
      "/circuits":    silentProxy(),
      "/simulate":    silentProxy(),
      "/query":       silentProxy(),
      "/reindex":     silentProxy(),
      "/voice-assist":silentProxy(),
      "/analyze":     silentProxy(),
      "/convert":     silentProxy(),
      "/qlive":       silentProxy(),
      "/vision":      silentProxy(),
      "/algohub":     silentProxy(),
      "/ws":          silentProxy({ target: "ws://127.0.0.1:8000", ws: true }),
    },
  },
  // base: "/Qubit_Tracer/", // <-- your repo name here
});

