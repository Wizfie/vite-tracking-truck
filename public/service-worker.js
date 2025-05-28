// public/service-worker.js
// HANYA gunakan satu event listener push untuk backend
self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activated");
});

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push event received", event);
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Pengingat Tracking";
  const options = {
    body:
      data.body || "Jangan lupa buka aplikasi untuk update lokasi kendaraan!",
    icon: "/favicon-96x96.png",
    badge: "/favicon-96x96.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  // Fokus ke tab jika ada, atau buka baru
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
