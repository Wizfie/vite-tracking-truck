// public/service-worker.js
self.addEventListener("push", function (event) {
  const options = {
    body: event.data.text(),
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
  };
  event.waitUntil(
    self.registration.showNotification("Vehicle Tracker", options)
  );
});
