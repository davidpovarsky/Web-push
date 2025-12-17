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
  } catch (e) {
    data = {
      title: "Push",
      body: event.data ? event.data.text() : "New message"
    };
  }

  const title = data.title || "התראה";
  const body  = data.body  || "לחץ לביצוע פעולה";

  const urlToOpen =
    data.url || "./index.html";

  const options = {
    body,
    icon: data.icon || "./icon-192.png",
    badge: data.badge || "./icon-192.png",
    data: {
      url: urlToOpen
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

  const urlToOpen =
    event.notification?.data?.url || "./index.html";

  // ⚠️ קריטי ל-iOS:
  // אין תנאים, אין matchAll, אין focus
  // רק openWindow מיידי

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});