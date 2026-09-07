import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0 so other devices on LAN can connect
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/circuits': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/simulate': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/query': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/reindex': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/voice-assist': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/analyze': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/convert': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/qlive': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/vision': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  // base: "/Qubit_Tracer/", // <-- your repo name here
});
