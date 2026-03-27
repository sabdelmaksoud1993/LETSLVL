import { createClient } from "@/lib/supabase-browser";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/**
 * Converts a URL-safe base64 string to a Uint8Array for the push subscription
 * applicationServerKey parameter.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests notification permission from the user and registers the service
 * worker. Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Notifications are not supported in this browser.");
    return false;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return false;
  }

  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.error("Service worker registration failed:", err);
  }

  return true;
}

/**
 * Subscribes the current browser to push notifications and stores the
 * subscription in the user's Supabase profile (push_subscription column).
 */
export async function subscribeToNotifications(
  userId: string
): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  // If no VAPID key is configured, skip push subscription but keep local
  // notification support via the service worker.
  if (!VAPID_PUBLIC_KEY) {
    console.info(
      "VAPID key not configured. Push subscription skipped; local notifications still work."
    );
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  });

  const supabase = createClient();
  await supabase
    .from("profiles")
    .update({ push_subscription: JSON.stringify(subscription) })
    .eq("id", userId);
}

/**
 * Shows a local notification using the Notification API. Does not require a
 * push server -- useful for in-app real-time alerts such as outbid events or
 * streams going live.
 */
export function sendLocalNotification(
  title: string,
  body: string,
  url?: string
): void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
  });

  if (url) {
    notification.onclick = () => {
      window.open(url, "_blank");
      notification.close();
    };
  }
}
