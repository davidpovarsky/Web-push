/* sw.js */

/* =========================
   התקנה והפעלה
========================= */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* =========================
   קבלת PUSH
========================= */

self.addEventListener("push", (event) => {
  let data = {};
  let body = "";

  try {
    if (event.data) {
      data = event.data.json();
      body = data.body || "";
    }
  } catch (e) {
    body = event.data ? event.data.text() : "";
  }

  const title = data.title || "התראה";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      data: {
        pushBody: body
      }
    })
  );
});

/* =========================
   לחיצה על ההתראה
========================= */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const pushBody =
    event.notification.data &&
    event.notification.data.pushBody
      ? event.notification.data.pushBody
      : "";

  const targetUrl =
    "./index.html?pushBody=" + encodeURIComponent(pushBody);

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});