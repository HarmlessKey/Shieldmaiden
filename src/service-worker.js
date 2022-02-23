/**
 * Through vue.config.js a service worker is rendered with the content of this file.
 * This rendered service worker will have workbox imported, so we don't have to do this here.
 */

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 

workbox.core.setCacheNameDetails({prefix: "harmlesskey"});

// Precache array of routes (precacheManifest = this array)
// https://developers.google.com/web/tools/workbox/modules/workbox-precaching
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

// This assumes /index.html has been precached.
// https://developers.google.com/web/tools/workbox/modules/workbox-routing#how_to_register_a_navigation_route
workbox.routing.registerNavigationRoute('/200.html', {
  blacklist: [
    new RegExp('^/compendium'),
    new RegExp('^/admin'),
    new RegExp('^/feedback'),
    new RegExp('^/patreon'),
    new RegExp('^/user'),
    new RegExp('^/about-us'),
    new RegExp('^/documentation'),
    new RegExp('^/privacy-policy'),
    new RegExp('^/demo'),
  ]
});
