/**
 * Medical Device provider registry (DI). Swap to connect a real
 * device-plugin backend with no UI change.
 */
import type { MedicalDeviceProvider } from "./types";
import { MockMedicalDeviceProvider } from "./MockMedicalDeviceProvider";

let current: MedicalDeviceProvider = new MockMedicalDeviceProvider();

export function getDeviceProvider(): MedicalDeviceProvider {
  return current;
}
export function setDeviceProvider(provider: MedicalDeviceProvider): void {
  current = provider;
}
