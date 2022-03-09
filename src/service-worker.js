/**
 * Through vue.config.js a service worker is rendered with the content of this file.
 * This rendered service worker will have workbox imported, so we don't have to do this here.
 */

self.addEventListener('message', (event) => {
  if(event.origin !== "https://harmlesskey.com" && event.origin !== "https://staging.harmlesskey.com") 
    return;
    
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

workbox.core.setCacheNameDetails({prefix: "harmlesskey"});

// Precache array of routes (precacheManifest = this array)
// https://developers.google.com/web/tools/workbox/modules/workbox-precaching
self.__precacheManifest = [{ url: "/200.html", revision: Date.now() }].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

// This assumes /200.html has been precached.
// https://developers.google.com/web/tools/workbox/modules/workbox-routing#how_to_register_a_navigation_route
workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("200.html"), {
  blacklist: [
    /^\/compendium/,
    /^\/admin/,
    /^\/patreon/,
    /^\/user/,
    /^\/about-us/,
    /^\/documentation/,
    /^\/privacy-policy/,
    /^\/demo/
  ],
});