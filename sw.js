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

  // 🔥 שולח הודעה לכל הלקוחות הפתוחים
  event.waitUntil(
    Promise.all([
      // מציג התראה
      self.registration.showNotification(title, {
        body: body,
        data: {
          pushUrl: pushUrl,   // יכול להיות ריק אם השרת לא מעביר
          pushBody: body      // תמיד יהיה זמין (כי זה מוצג בהתראה)
        }
      }),
      
      // שולח הודעה ללקוחות פתוחים
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            pushUrl: pushUrl,
            pushBody: body
          });
        });
      })
    ])
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
    // 🔥 מחפש אם יש חלון פתוח ומנווט אליו, אחרת פותח חדש
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // אם יש חלון פתוח, נווט אליו
      for (let client of windowClients) {
        if ('focus' in client) {
          return client.focus().then(client => {
            return client.navigate(targetUrl);
          });
        }
      }
      // אחרת פתח חלון חדש
      return clients.openWindow(targetUrl);
    })
  );
});