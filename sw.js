/* sw.js */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* =========================
   קבלת PUSH מהשרת
========================= */

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {}

  const title = data.title || "התראה";
  const body  = data.body  || "לחץ לפתיחה";

  // הקישור שאנחנו רוצים להפעיל (למשל shortcuts://...)
  const pushUrl = data.url || "";

  const options = {
    body,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: {
      pushUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* =========================
   לחיצה על ההתראה
========================= */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const pushUrl = event.notification.data?.pushUrl || "";

  // פותחים את האפליקציה במצב "הופעל ע״י push"
  const targetUrl =
    "./index.html?pushUrl=" + encodeURIComponent(pushUrl);

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});