/* sw.js */

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

/* =========================
   קבלת PUSH
========================= */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}

  const title = data.title || "התראה";
  const body  = data.body  || "";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { body }
    })
  );
});

/* =========================
   לחיצה על ההתראה
========================= */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const body = event.notification.data?.body || "";

  const target =
    "./index.html?pushBody=" + encodeURIComponent(body);

  event.waitUntil(
    clients.openWindow(target)
  );
});