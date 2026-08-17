const DEVICE_ID_KEY = "momentum-push-device-id";

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getStoredDeviceId() {
  try {
    return window.localStorage.getItem(DEVICE_ID_KEY);
  } catch {
    return null;
  }
}

export function setStoredDeviceId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(DEVICE_ID_KEY, id);
    else window.localStorage.removeItem(DEVICE_ID_KEY);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export async function ensurePushWorker() {
  if (!pushSupported()) {
    throw new Error("Push is not supported in this browser");
  }
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function getPushSubscription() {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(publicKey: string) {
  if (!publicKey) {
    throw new Error("Push is not configured on the server");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications were blocked for this site");
  }
  const registration = await ensurePushWorker();
  await navigator.serviceWorker.ready;
  const current = await registration.pushManager.getSubscription();
  if (current) await current.unsubscribe();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function unsubscribeFromPush() {
  const subscription = await getPushSubscription();
  if (subscription) await subscription.unsubscribe();
}

export function subscriptionToPayload(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error("This browser did not return a complete push subscription");
  }
  return {
    endpoint,
    keys: { p256dh, auth },
    platform: "WEB" as const,
  };
}
