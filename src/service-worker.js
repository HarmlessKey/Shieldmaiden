/**
 * Through vue.config.js a service worker is rendered with the content of this file.
 * This rendered service worker will have workbox imported, so we don't have to do this here.
 */

/** 
* Cache css & js
* StaleWhileRevalidate means we only use cache when offline. 
* New files will be fetched if there is an internet connection
*/
workbox.routing.registerRoute(
  /\.(?:css|js)$/,
  new workbox.strategies.StaleWhileRevalidate({
    "cacheName": "assets",
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 1000,
        maxAgeSeconds: 60*60*24*30 // month
      })
    ]
  })
);

/** 
* Cache media
* CacheFirst means we get the file from the cache if present and only download if not. 
*/
workbox.routing.registerRoute(
  /\.(?:png|jpg|gif|webp|webm|svg)$/,
  new workbox.strategies.CacheFirst({
    "cacheName": "media",
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 100,
        maxAgeSeconds: 60*60*24*365 // year
      })
    ]
  })
);



// workbox.core.setCacheNameDetails({prefix: "harmlesskey"});

// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });

// workbox.routing.registerNavigationRoute("/index.html", {
//   blacklist: [
//     /^\/compendium/,
//     /^\/admin/,
//     /^\/feedback/,
//     /^\/patreon/,
//     /^\/user/,
//     /^\/about-us/,
//     /^\/documentation/,
//     /^\/privacy-policy/,
//   ]
// });

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
// self.__precacheManifest = [].concat(self.__precacheManifest || []);
// workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


