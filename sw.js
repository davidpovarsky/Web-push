/* sw.js */

self.addEventListener("install", (event) => {
  // גורם ל-SW להיכנס לפעולה מייד
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // הופך אותו לפעיל גם אם יש טאבים פתוחים
  event.waitUntil(self.clients.claim());
});

/* ===============================
   קבלת PUSH מהשרת
================================ */

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
  const body = data.body || "לחץ לביצוע פעולה";

  // ⬅️ כאן היעד – יכול להיות URL רגיל או shortcuts://
  const targetUrl =
    data.url ||
    "./index.html";

  const options = {
    body,
    icon: data.icon || "./icon-192.png",
    badge: data.badge || "./icon-192.png",
    data: {
      url: targetUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* ===============================
   לחיצה על ההתראה
================================ */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen =
    (event.notification.data && event.notification.data.url) ||
    "./index.html";

  event.waitUntil((async () => {

    // אם זה shortcuts:// – פותחים בלי בדיקות טאבים
    if (urlToOpen.startsWith("shortcuts://")) {
      return clients.openWindow(urlToOpen);
    }

    // אחרת – התנהגות רגילה של PWA
    const allClients = await clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of allClients) {
      if (client.url.includes(urlToOpen)) {
        return client.focus();
      }
    }

    return clients.openWindow(urlToOpen);

  })());
});