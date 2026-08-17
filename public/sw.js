self.addEventListener("push", (event) => {
  let title = "Momentum";
  let body = "Time to mark the day.";

  try {
    const payload = event.data ? event.data.json() : null;
    if (payload && typeof payload === "object") {
      if (typeof payload.title === "string") title = payload.title;
      if (typeof payload.body === "string") body = payload.body;
      else if (typeof payload.message === "string") body = payload.message;
    }
  } catch {
    const text = event.data?.text();
    if (text) body = text;
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/dashboard"));
});
