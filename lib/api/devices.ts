import { api } from "@/lib/api/client";
import { devicePath } from "@/lib/api/config";
import type {
  Device,
  RegisterDeviceRequest,
  VapidPublicKeyResponse,
} from "@/lib/api/types";

export async function getVapidPublicKey(): Promise<string> {
  const payload = await api.get<VapidPublicKeyResponse>(
    devicePath("vapid-public-key"),
    { skipAuthRetry: true },
  );
  return payload.publicKey ?? "";
}

export async function listDevices(): Promise<Device[]> {
  const payload = await api.get<{ devices: Device[] }>(devicePath());
  return Array.isArray(payload.devices) ? payload.devices : [];
}

export async function registerDevice(
  body: RegisterDeviceRequest,
): Promise<Device> {
  const payload = await api.post<{ device: Device }>(
    devicePath(),
    body as Record<string, unknown>,
  );
  return payload.device;
}

export async function deleteDevice(deviceId: string): Promise<void> {
  await api.delete(devicePath(deviceId));
}
