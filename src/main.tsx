import React from "react";
import ReactDOM from "react-dom/client";
import { PhysioTrackApp } from "./app/PhysioTrackApp";
import { configureIntegrations } from "./integrations/config";
// Nocturne design system (reused verbatim from Claude Design) + app globals.
import "./styles/nocturne.css";
import "./styles/global.css";

// Select integration providers from configuration (mock by default; the real
// external Jarvis is wired here via env — see integrations/config.ts).
configureIntegrations();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PhysioTrackApp defaultLanguage="ar" showIntro reducedMotion={false} />
  </React.StrictMode>,
);
