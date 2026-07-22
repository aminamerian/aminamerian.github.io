/* Minimal FCM service worker — matches Firebase docs (compat + importScripts). */
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

firebase.messaging();
