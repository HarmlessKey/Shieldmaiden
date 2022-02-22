workbox.core.setCacheNameDetails({prefix: "harmlesskey"});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

workbox.routing.registerNavigationRoute("/index.html", {
  // blacklist: [
  //   new RegExp('/compendium'),
  //   new RegExp('/feedback'),
  //   new RegExp('/patreon'),
  //   new RegExp('/user'),
  //   new RegExp('/about-us'),
  //   new RegExp('/updates'),
  //   new RegExp('/documentation'),
  //   new RegExp('/privacy-policy'),
  // ],
  blacklist: [
    /^\/compendium/,
    /^\/admin/,
    /^\/feedback/,
    /^\/patreon/,
    /^\/user/,
    /^\/about-us/,
    /^\/documentation/,
    /^\/privacy-policy/,
  ]
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
// self.__precacheManifest = [].concat(self.__precacheManifest || []);
// workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


