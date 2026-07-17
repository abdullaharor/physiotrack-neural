# Module: Medical Devices

Treat all medical devices as **plugins**. The core works with the module
disabled.

## Required providers

- `DisabledMedicalDeviceProvider` — module off; device entry points hidden.
- `MockMedicalDeviceProvider` — static catalog + demo paired devices (current
  default); no real transport.
- `RemoteMedicalDeviceProvider` — connects real devices via a BLE / Wi-Fi
  bridge or device service.

## Dedicated "Medical Devices Integration" page

Inside Integrations & Modules: enable/disable, active provider selection
(Disabled / Mock / Remote), bridge/service configuration, health, connection
status, **Test Connection**, and **logs** (pairing/connection events).

## Current status in the repo

Implemented under `src/integrations/devices/`: `types.ts`
(`MedicalDeviceProvider`), `MockMedicalDeviceProvider`, `provider.ts` (DI). The
Devices screen (`app/screens/Devices.tsx`) renders the catalog + paired devices
from the provider.

**Groundwork still to add** (`CODE_REQUIRED`; page visuals `DESIGN_REQUIRED`):
`DisabledMedicalDeviceProvider`, `RemoteMedicalDeviceProvider`, enable/disable,
health/connection/test/logs, and the Medical Devices Integration page.
