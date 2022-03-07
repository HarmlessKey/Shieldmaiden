import { register } from "register-service-worker";
import { Notify } from 'quasar';

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () { /* App is being served from cache by a service worker */ },
    registered () { /* Service worker has been registered */ },
    cached () { /* Content has been cached for offline use */ },
    updatefound () { /* New content is downloading. */ },
    updated (registration) {
      // Nofitify the user and let them download the new content
      Notify.create({
        message: "New content available.",
        icon: "fas fa-sync",
        color: "primary",
        position: "top",
        timeout: 0,
        actions: [
          { label: 'Fetch', color: 'white', handler: () => { registration.waiting.postMessage({ type: "SKIP_WAITING" }); } },
          { label: 'Cancel', color: 'white', handler: () => { /* ... */ } }
        ]
      });
    },
    offline () { /* No internet connection found. App is running in offline mode */ },
    error (error) {
      console.error("[registerServiceWorker] Error during service worker registration:", error);
    }
  });
}

let refreshing;
navigator.serviceWorker.addEventListener("controllerChange", () => {
  if(refreshing) return;
  window.location.reload();
  refreshing = true;
});