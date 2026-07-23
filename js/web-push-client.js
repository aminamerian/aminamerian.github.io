/**
 * Browser-side Web Push subscribe/unsubscribe against a Django API.
 * Depends on window.WEB_PUSH_CONFIG from web-push-config.js.
 */
(function () {
  function getConfig() {
    const cfg = window.WEB_PUSH_CONFIG;
    if (!cfg) {
      throw new Error("WEB_PUSH_CONFIG is missing. Load web-push-config.js first.");
    }
    return cfg;
  }

  function vapidKeyToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  }

  function apiUrl(path) {
    const { apiBaseUrl } = getConfig();
    return `${apiBaseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async function waitForActivated(registration) {
    const worker =
      registration.installing || registration.waiting || registration.active;
    if (!worker) {
      throw new Error("Service worker registration has no worker.");
    }
    if (worker.state === "activated") {
      return registration;
    }
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Service worker did not activate within 15 seconds."));
      }, 15000);
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") {
          clearTimeout(timer);
          resolve();
        } else if (worker.state === "redundant") {
          clearTimeout(timer);
          reject(new Error("Service worker became redundant."));
        }
      });
    });
    return registration;
  }

  async function registerServiceWorker() {
    const { serviceWorkerUrl, serviceWorkerScope } = getConfig();
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported in this browser.");
    }
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: serviceWorkerScope,
    });
    return waitForActivated(registration);
  }

  async function ensurePermission() {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported in this browser.");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error(`Notification permission was ${permission}.`);
    }
    return permission;
  }

  async function subscribe() {
    const cfg = getConfig();
    if (
      !cfg.vapidPublicKey ||
      cfg.vapidPublicKey.startsWith("REPLACE_") ||
      !cfg.apiBaseUrl ||
      cfg.apiBaseUrl.includes("REPLACE_")
    ) {
      throw new Error(
        "Configure apiBaseUrl and vapidPublicKey in js/web-push-config.js first."
      );
    }

    await ensurePermission();
    const registration = await registerServiceWorker();

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyToUint8Array(cfg.vapidPublicKey),
      });
    }

    const body = subscription.toJSON();
    const response = await fetch(apiUrl(cfg.subscribePath), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: body.endpoint,
        keys: body.keys,
        expirationTime: body.expirationTime ?? null,
        user_agent: navigator.userAgent,
      }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const detail =
        payload?.detail ||
        payload?.error ||
        (typeof payload === "string" ? payload : null) ||
        `HTTP ${response.status}`;
      throw new Error(`Subscribe API failed: ${detail}`);
    }

    return {
      subscription: body,
      server: payload,
    };
  }

  async function unsubscribe() {
    const cfg = getConfig();
    const registration = await navigator.serviceWorker.getRegistration(
      cfg.serviceWorkerScope
    );
    if (!registration) {
      return { ok: true, detail: "No service worker registration." };
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return { ok: true, detail: "No push subscription." };
    }

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    try {
      await fetch(apiUrl(cfg.unsubscribePath), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      // Local unsubscribe still succeeded even if API is unreachable.
    }

    return { ok: true, endpoint };
  }

  async function getCurrentSubscription() {
    const cfg = getConfig();
    const registration = await navigator.serviceWorker.getRegistration(
      cfg.serviceWorkerScope
    );
    if (!registration) {
      return null;
    }
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? subscription.toJSON() : null;
  }

  window.WebPushClient = {
    subscribe,
    unsubscribe,
    getCurrentSubscription,
    registerServiceWorker,
  };
})();
