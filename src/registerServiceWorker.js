/* eslint-disable no-console */

import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      // console.log(
      //   "[registerServiceWorker] App is being served from cache by a service worker.\n" +
      //   "For more details, visit https://goo.gl/AFskqB"
      // )
    },
    registered () {
      // console.log("[registerServiceWorker] Service worker has been registered.")
    },
    cached () {
      // console.log("[registerServiceWorker] Content has been cached for offline use.")
    },
    updatefound () {
      // console.log("[registerServiceWorker] New content is downloading.")
    },
    updated () {
      // console.log("[registerServiceWorker] New content is available; please refresh.");

      // Cleares old cache so new content is downloaded
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
          console.log("[registerServiceWorker] Cleared cache:", name)
        }
      });
    },
    offline () {
      // console.log("[registerServiceWorker] No internet connection found. App is running in offline mode.")
    },
    error (error) {
      console.error("[registerServiceWorker] Error during service worker registration:", error)
    }
  })
}
