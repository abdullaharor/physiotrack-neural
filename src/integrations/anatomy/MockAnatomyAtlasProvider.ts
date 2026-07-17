/**
 * MockAnatomyAtlasProvider — reports the anatomy module as "coming soon"
 * (matching the preserved v3 UI). It carries the manifest a real engine will
 * fulfill but performs no rendering. Replacing it with a real provider (e.g.
 * a ThreeAnatomyAtlasProvider) lights up the same slot with zero UI changes.
 */
import type {
  AnatomyAtlasProvider,
  AnatomyLaunchRequest,
  AnatomyLaunchResult,
  AnatomyManifest,
} from "./types";
import { ANATOMY_MODULE } from "../../data/registries";

export class MockAnatomyAtlasProvider implements AnatomyAtlasProvider {
  readonly id = "mock-anatomy";

  getManifest(): AnatomyManifest {
    return {
      id: ANATOMY_MODULE.id,
      status: "coming_soon",
      engine: ANATOMY_MODULE.engine,
      dataset: ANATOMY_MODULE.dataset,
      featureKeys: ANATOMY_MODULE.featureKeys,
    };
  }

  isReady(): boolean {
    return false;
  }

  async launch(_req: AnatomyLaunchRequest): Promise<AnatomyLaunchResult> {
    return { launched: false, reason: "module_coming_soon" };
  }
}
