/* FCM background service worker (compat SDK — required for importScripts). */
importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBjp1wh93oOaI44iDcZMSivjzSVEjHI_eM",
  authDomain: "personal-website-8c1d9.firebaseapp.com",
  projectId: "personal-website-8c1d9",
  storageBucket: "personal-website-8c1d9.firebasestorage.app",
  messagingSenderId: "638275138476",
  appId: "1:638275138476:web:e2bf4ae4bfa404e00e8009",
  measurementId: "G-DK0C5G97RJ",
});

// Activate immediately so getToken can talk to this worker.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New message";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new notification.",
    icon: "/favicon.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
