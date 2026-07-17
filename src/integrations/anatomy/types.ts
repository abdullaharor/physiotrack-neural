/**
 * Anatomy Atlas integration contract.
 *
 * The 3D anatomy atlas is an EXTERNAL module/plugin — it is not hardcoded
 * into the core app. The host renders whatever the provider reports: today a
 * "coming soon" manifest; later a real Three.js / Z-Anatomy engine that mounts
 * into the anatomy slot (and can be launched from a patient profile) without
 * any change to the host UI.
 */
export type AnatomyStatus = "coming_soon" | "ready" | "error";
export type Gender = "male" | "female";

export interface AnatomyManifest {
  id: string;
  status: AnatomyStatus;
  engine: string;
  dataset: string;
  /** Localized feature bullet keys (resolved by the host's i18n). */
  featureKeys: string[];
}

export interface AnatomyLaunchRequest {
  patientId: number;
  gender: Gender;
  /** Optional focus region derived from the patient's dxKey. */
  region?: string;
}

export interface AnatomyLaunchResult {
  launched: boolean;
  /** When not launched, why (e.g. module locked / coming soon). */
  reason?: string;
}

export interface AnatomyAtlasProvider {
  readonly id: string;
  getManifest(): AnatomyManifest;
  isReady(): boolean;
  /** Attempt to launch the atlas for a patient; mock returns not-launched. */
  launch(req: AnatomyLaunchRequest): Promise<AnatomyLaunchResult>;
}
