/**
 * MockMedicalDeviceProvider — surfaces the static device catalog + demo
 * paired devices from the registry. No real BLE/Wi-Fi transport; a real
 * provider implementing this interface replaces it with no UI change.
 */
import type {
  DeviceCategory,
  DeviceDescriptor,
  MedicalDeviceProvider,
  PairedDevice,
} from "./types";
import { DEVICE_REGISTRY, DEVICE_CATEGORIES, PAIRED_DEMO } from "../../data/registries";

export class MockMedicalDeviceProvider implements MedicalDeviceProvider {
  readonly id = "mock-devices";
  getCatalog(): DeviceDescriptor[] {
    return DEVICE_REGISTRY as DeviceDescriptor[];
  }
  getCategories(): DeviceCategory[] {
    return DEVICE_CATEGORIES as DeviceCategory[];
  }
  getPairedDevices(): PairedDevice[] {
    return PAIRED_DEMO as PairedDevice[];
  }
}
