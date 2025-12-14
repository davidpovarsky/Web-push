/* sw.js */

self.addEventListener("install", (event) => {
  // גורם ל-SW להיכנס לפעולה מהר
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // הופך אותו ל-SW פעיל גם אם יש טאבים פתוחים
  event.waitUntil(self.clients.claim());
});

// ✅ כשמגיעה הודעת push מהשרת
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Push", body: event.data ? event.data.text() : "New message" };
  }

  const title = data.title || "התראה";
  const options = {
    body: data.body || "התקבלה הודעה",
    icon: data.icon || "./icon-192.png",
    badge: data.badge || "./icon-192.png",
    data: {
      url: data.url || "./index.html"
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ✅ מה קורה כשהמשתמש לוחץ על ההתראה
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "./index.html";

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of allClients) {
      // אם כבר פתוח – מביא לפוקוס
      if (client.url.includes(urlToOpen) || client.url.includes("index.html")) {
        return client.focus();
      }
    }
    // אחרת פותח חדש
    return clients.openWindow(urlToOpen);
  })());
});
