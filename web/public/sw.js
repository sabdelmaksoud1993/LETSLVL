/* eslint-disable no-restricted-globals */

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "LET'S LVL";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data.url;
  event.waitUntil(clients.openWindow(url));
});
