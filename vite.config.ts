import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server on 5173. If/when a real backend or the external Jarvis service
// is added, proxy its routes here (e.g. "/api" or "/jarvis").
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: "127.0.0.1" },
});
