/**
 * Integration configuration — the single place where providers are selected.
 *
 * Connecting the real external Jarvis (Codex) needs no code changes in the
 * app: set environment variables and this module wires the RemoteJarvisProvider
 * in place of the mock. No API keys live in code — the endpoint comes from env
 * and any auth token is supplied at call time by the host.
 *
 *   VITE_JARVIS_PROVIDER = "mock" | "remote"     (default: "mock")
 *   VITE_JARVIS_API_URL  = "https://…"           (required for "remote")
 *
 * Call configureIntegrations() once at startup (see main.tsx).
 */
import { setJarvisProvider } from "./jarvis/provider";
import { MockJarvisProvider } from "./jarvis/MockJarvisProvider";
import { RemoteJarvisProvider } from "./jarvis/RemoteJarvisProvider";
// Anatomy + device providers default to their mocks via their own registries;
// import their setters here to swap them the same way when real ones exist.
// import { setAnatomyProvider } from "./anatomy/provider";
// import { setDeviceProvider } from "./devices/provider";

type Env = Record<string, string | undefined>;

function readEnv(): Env {
  try {
    // Vite exposes import.meta.env; guard so this file is also test-safe.
    return (import.meta as unknown as { env?: Env }).env ?? {};
  } catch {
    return {};
  }
}

export function configureIntegrations(): void {
  const env = readEnv();
  const which = (env.VITE_JARVIS_PROVIDER || "mock").toLowerCase();

  if (which === "remote" && env.VITE_JARVIS_API_URL) {
    setJarvisProvider(new RemoteJarvisProvider({ endpoint: env.VITE_JARVIS_API_URL }));
  } else {
    setJarvisProvider(new MockJarvisProvider());
  }

  // Anatomy atlas and medical devices already default to their mock providers.
  // When the real modules exist, select them here based on env, e.g.:
  //   if (env.VITE_ANATOMY_PROVIDER === "three") setAnatomyProvider(new ThreeAnatomyAtlasProvider());
}
