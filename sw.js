/* sw.js */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  let body = "";

  try {
    if (event.data) {
      // iOS/שרתים שונים – לפעמים json, לפעמים text
      const txt = event.data.text();
      try {
        data = JSON.parse(txt);
      } catch {
        // לא JSON
        data = {};
        body = txt || "";
      }
      if (!body) body = data.body || "";
    }
  } catch (e) {
    body = "";
    data = {};
  }

  const title = data.title || "התראה";

  // 🔥 נסיון לקבל url – אם השרת מעביר אותו
  const pushUrl = (data.url || "").trim();

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      data: {
        pushUrl: pushUrl,   // יכול להיות ריק אם השרת לא מעביר
        pushBody: body      // תמיד יהיה זמין (כי זה מוצג בהתראה)
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const pushUrl = (event.notification.data?.pushUrl || "").trim();
  const pushBody = (event.notification.data?.pushBody || "").trim();

  // מעבירים לשני הערוצים – כדי שתוכל לבדוק מה באמת הגיע
  const targetUrl =
    "./index.html?pushUrl=" + encodeURIComponent(pushUrl) +
    "&pushBody=" + encodeURIComponent(pushBody);

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});