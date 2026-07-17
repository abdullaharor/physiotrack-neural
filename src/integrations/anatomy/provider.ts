/**
 * Anatomy Atlas provider registry (DI). The host reads the active atlas
 * provider here; swap it to mount a real 3D engine with no UI change.
 */
import type { AnatomyAtlasProvider } from "./types";
import { MockAnatomyAtlasProvider } from "./MockAnatomyAtlasProvider";

let current: AnatomyAtlasProvider = new MockAnatomyAtlasProvider();

export function getAnatomyProvider(): AnatomyAtlasProvider {
  return current;
}
export function setAnatomyProvider(provider: AnatomyAtlasProvider): void {
  current = provider;
}
