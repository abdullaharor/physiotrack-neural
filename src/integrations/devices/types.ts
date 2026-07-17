/**
 * Medical Device integration contract.
 *
 * Rehabilitation equipment connects through a plugin architecture — each
 * device is a self-contained plugin the core app discovers at runtime. The
 * host renders the catalog and paired devices the provider reports; a real
 * backend (BLE/Wi-Fi bridge) replaces the mock without any UI change.
 */
export type DeviceStatus = "connected" | "ready" | "planned";
export type DeviceCat = "measure" | "sensors" | "therapy" | "connect";

export interface DeviceDescriptor {
  cat: DeviceCat;
  en: string;
  ar: string;
  conn: string;
  status: DeviceStatus;
}

export interface DeviceCategory {
  id: DeviceCat;
  en: string;
  ar: string;
}

export interface PairedDevice {
  name: string;
  metaEn: string;
  metaAr: string;
  icon: string;
}

export interface MedicalDeviceProvider {
  readonly id: string;
  /** Full supported-plugin catalog. */
  getCatalog(): DeviceDescriptor[];
  /** Catalog groupings for the UI. */
  getCategories(): DeviceCategory[];
  /** Currently paired/connected devices (demo data in the mock). */
  getPairedDevices(): PairedDevice[];
}
