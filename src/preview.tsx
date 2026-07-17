import React from "react";
import ReactDOM from "react-dom/client";
import { PhysioTrackPreview } from "./dev/PhysioTrackPreview";
import { configureIntegrations } from "./integrations/config";
import "./styles/nocturne.css";
import "./styles/global.css";

/**
 * Design-preview entry point (DEVELOPMENT ONLY).
 *
 * Mounts the REAL PhysioTrackApp wrapped in the preview harness (role switcher,
 * module-state switcher, language). It uses the app's built-in mock data and
 * mock providers, so every existing screen renders with NO backend services.
 * Production uses src/main.tsx (no harness); this file is never part of the
 * shipped product.
 */
configureIntegrations();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PhysioTrackPreview />
  </React.StrictMode>,
);
