"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteDevice, listDevices, registerDevice } from "@/lib/api/devices";
import type { RegisterDeviceRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { deviceKeys } from "@/lib/devices/keys";

export function useDevices() {
  const { user, isLoading } = useAuth();

  return useQuery({
    queryKey: deviceKeys.list(),
    queryFn: listDevices,
    enabled: !isLoading && Boolean(user),
  });
}

function useInvalidateDevices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: deviceKeys.all });
}

export function useRegisterDevice() {
  const invalidate = useInvalidateDevices();

  return useMutation({
    mutationFn: (body: RegisterDeviceRequest) => registerDevice(body),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteDevice() {
  const invalidate = useInvalidateDevices();

  return useMutation({
    mutationFn: (deviceId: string) => deleteDevice(deviceId),
    onSuccess: () => invalidate(),
  });
}
