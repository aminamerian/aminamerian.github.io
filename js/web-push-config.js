/**
 * Web Push client config.
 *
 * Fill these AFTER you generate VAPID keys on the Django backend:
 *   python manage.py shell
 *   # or:  pywebpush / py-vapid generate
 *
 * apiBaseUrl must be reachable from your users (including Iran) without VPN.
 * Do NOT put the VAPID private key here — private key stays on Django only.
 */
window.WEB_PUSH_CONFIG = {
  apiBaseUrl: "https://api-dev-dc.machtechteam.com",

  vapidPublicKey: "BLLluH66ASXeChjsmFFR3fNMoeg-NgEROVHSKRwjTEFOOLX-t2G93jlHt7BPnr6EQJiBppNlbeOxkeKWQuCZT5g",

  subscribePath: "/api/web-push/subscribe/",
  unsubscribePath: "/api/web-push/unsubscribe/",

  // Service worker at site root (required for broad scope)
  serviceWorkerUrl: "/sw.js",
  serviceWorkerScope: "/",
};
