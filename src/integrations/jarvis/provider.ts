/**
 * Jarvis provider registry (dependency injection).
 *
 * The whole app reads the active provider through getJarvisProvider(). Tests,
 * previews and production swap implementations with setJarvisProvider() — the
 * UI never imports a concrete provider directly, so connecting the real
 * external Jarvis is a one-line change made in one place (see config.ts).
 */
import type { JarvisProvider } from "./types";
import { MockJarvisProvider } from "./MockJarvisProvider";

let current: JarvisProvider = new MockJarvisProvider();
const listeners = new Set<(p: JarvisProvider) => void>();

export function getJarvisProvider(): JarvisProvider {
  return current;
}

export function setJarvisProvider(provider: JarvisProvider): void {
  current = provider;
  listeners.forEach((fn) => fn(provider));
}

/** Subscribe to provider swaps (returns an unsubscribe fn). */
export function onJarvisProviderChange(fn: (p: JarvisProvider) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
