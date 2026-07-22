/**
 * Minimal FCM service worker.
 *
 * Do NOT call firebase.messaging() here during getToken flows.
 * Compat messaging in the SW opens `firebase-messaging-database` and can
 * permanently block the page's getToken() IndexedDB open (SDK `blocked` is a no-op).
 *
 * An active SW is enough for PushManager.subscribe / getToken on the page.
 * Background notification display can be added later without holding IDB at startup.
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let title = "New message";
  let body = "You have a new notification.";
  let data = {};

  try {
    const payload = event.data ? event.data.json() : {};
    data = payload.data || {};
    title =
      payload.notification?.title || data.title || title;
    body = payload.notification?.body || data.body || body;
  } catch {
    const text = event.data ? event.data.text() : "";
    if (text) {
      body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.png",
      data,
    })
  );
});
