workbox.core.setCacheNameDetails({prefix: "harmlesskey_app"});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


// Blacklist certain URLs for SEO purposes
// This will prevent the prerendered pages from flashing the home screen first.
workbox.routing.registerNavigationRoute("/index.html", {
  blacklist: [/^\/compendium/,/^\/admin/],
});