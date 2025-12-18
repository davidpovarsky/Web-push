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
      const txt = event.data.text();
      try {
        data = JSON.parse(txt);
      } catch {
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
  const pushUrl = (data.url || "").trim();

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      data: {
        pushUrl: pushUrl,
        pushBody: body,
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const pushUrl = (event.notification.data?.pushUrl || "").trim();
  const pushBody = (event.notification.data?.pushBody || "").trim();

  const targetUrl =
    "./index.html?pushUrl=" + encodeURIComponent(pushUrl) +
    "&pushBody=" + encodeURIComponent(pushBody);

  event.waitUntil((async () => {
    // 1) אם יש חלון קיים — עדיף לפקס אותו ולשלוח אליו הודעה
    const winClients = await clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    if (winClients && winClients.length) {
      // בוחרים חלון "ראשי"
      const client = winClients[0];

      // ניסיון ניווט (לא תמיד נתמך/עובד ב-iOS, אבל לא מזיק)
      try {
        if (client.navigate) await client.navigate(targetUrl);
      } catch (_) {}

      try { if (client.focus) await client.focus(); } catch (_) {}

      // 🔥 הדבר החשוב: להעביר payload לחלון שכבר פתוח
      try {
        client.postMessage({
          type: "PUSH_PAYLOAD",
          pushUrl,
          pushBody,
          ts: Date.now(),
        });
      } catch (_) {}

      return;
    }

    // 2) אם אין חלון פתוח — לפתוח חדש עם הפרמטרים כמו קודם
    await clients.openWindow(targetUrl);
  })());
});