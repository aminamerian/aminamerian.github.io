/**
 * Minimal FCM service worker.
 *
 * Avoid firebase.messaging() at startup — it can block page getToken() via IndexedDB.
 * This worker still shows system notifications and notifies open pages.
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  event.waitUntil(handlePush(event));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/push.html";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

async function handlePush(event) {
  let title = "New message";
  let body = "You have a new notification.";
  let data = {};

  try {
    const payload = event.data ? event.data.json() : {};
    data = { ...(payload.data || {}), fcmMessageId: payload.fcmMessageId };
    title = payload.notification?.title || data.title || title;
    body = payload.notification?.body || data.body || body;
  } catch {
    const text = event.data ? event.data.text() : "";
    if (text) {
      body = text;
    }
  }

  const notificationPayload = { title, body, data };

  // Tell any open tabs (even outside this SW's narrow scope) to show in-page UI.
  const clientsArr = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clientsArr) {
    client.postMessage({
      type: "FCM_PUSH",
      ...notificationPayload,
    });
  }

  // Always show a system notification (needed for userVisibleOnly subscriptions,
  // and so it appears like other sites when the tab is in the background).
  await self.registration.showNotification(title, {
    body,
    icon: "/favicon.png",
    badge: "/favicon.png",
    tag: data.fcmMessageId || "fcm-push",
    renotify: true,
    data: notificationPayload,
  });
}
