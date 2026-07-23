/**
 * Web Push service worker (Najva-style / VAPID).
 * No Firebase — the browser push service delivers here after Django sends
 * a Web Push request to the stored subscription endpoint.
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
  let icon = "/favicon.png";
  let tag = "web-push";

  try {
    const payload = event.data ? event.data.json() : {};
    title = payload.title || title;
    body = payload.body || body;
    icon = payload.icon || icon;
    tag = payload.tag || tag;
    data = {
      url: payload.url || "/push.html",
      ...(payload.data || {}),
    };
  } catch {
    const text = event.data ? event.data.text() : "";
    if (text) {
      body = text;
    }
  }

  const notificationPayload = { title, body, data };

  const clientsArr = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clientsArr) {
    client.postMessage({
      type: "WEB_PUSH",
      ...notificationPayload,
    });
  }

  await self.registration.showNotification(title, {
    body,
    icon,
    badge: "/favicon.png",
    tag,
    renotify: true,
    data: notificationPayload,
  });
}
