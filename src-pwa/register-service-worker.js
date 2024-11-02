import { register } from 'register-service-worker';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (registration) {
    try {
      registration.update()
    } catch (err) {
      console.err('SW update failed:', err)
    }
  }


  updated (registration) {
    // Cleares old cash so new content is downloaded
    caches.keys().then(function(names) {
      for (let name of names) {
        console.log("SW Updated. Delete cache", name)
        caches.delete(name);
      }
    });

    // Nofitify the user and let them download the new content
    // Notify.create({
    //   message: "New content available.",
    //   type: "info",
    //   icon: "fas fa-arrow-alt-to-bottom",
    //   color: "neutral-7",
    //   iconSize: "15px",
    //   position: "top",
    //   timeout: 0,
    //   actions: [
    //     { label: 'Fetch', color: 'white', noCaps: true, size: "md", handler: () => { registration.waiting.postMessage({ type: "SKIP_WAITING" }); } },
    //   ]
    // });
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
});