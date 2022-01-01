if ("function" === typeof importScripts) {
  importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.4/workbox-sw.js");
  if (workbox) {
    workbox.setConfig({debug: false});
    self.addEventListener("install", event => {
      self.skipWaiting();
    });
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
    workbox.routing.registerRoute(
      new RegExp("https://fonts.(?:.googlepis|gstatic).com/(.*)"),
      workbox.strategies.cacheFirst({
        cacheName: "googleapis",
        plugins: [
          new workbox.expiration.ExpirationPlugin({
            maxEntries: 30
          })
        ]
      })
    );
    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg|svg|ico)$/,
      workbox.strategies.cacheFirst({
        cacheName: "images",
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
          })
        ]
      })
    );
    workbox.routing.registerRoute(
      /\.(?:js|css|wasm|json)$/,
      workbox.strategies.staleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 20 * 24 * 60 * 60 // 20 Days
          })
        ]
      })
    );
  } else console.error("Workbox could not be loaded. No offline support");
}