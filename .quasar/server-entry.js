/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.conf.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/

import '@quasar/extras/roboto-font/roboto-font.css'

import '@quasar/extras/material-icons/material-icons.css'




// We load Quasar stylesheet file
import 'quasar/dist/quasar.sass'




import 'src/css/styles.scss'


import createApp from './app.js'
import Vue from 'vue'

import App from 'app/src/App.vue'
const appOptions = App.options /* Vue.extend() */ || App



import qboot_Bootplugins from 'boot/plugins'

import qboot_Bootfirebaseauth from 'boot/firebase-auth'

import qboot_Boothkcomponents from 'boot/hk-components'

import qboot_Bootveevalidate from 'boot/vee-validate'


const publicPath = `/`


function redirectBrowser (url, router, reject, status) {
  const normalized = Object(url) === url
    ? router.resolve(url).route.fullPath
    : url

  reject({ url: normalized, code: status })
}

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default context => {
  return new Promise(async (resolve, reject) => {
    const { app, store, router } = await createApp(context)

    
    let hasRedirected = false
    const redirect = (url, status) => {
      hasRedirected = true
      redirectBrowser(url, router, reject, status)
    }

    const bootFiles = [qboot_Bootplugins,qboot_Bootfirebaseauth,qboot_Boothkcomponents,qboot_Bootveevalidate]
    for (let i = 0; hasRedirected === false && i < bootFiles.length; i++) {
      if (typeof bootFiles[i] !== 'function') {
        continue
      }

      try {
        await bootFiles[i]({
          app,
          router,
          store,
          Vue,
          ssrContext: context,
          redirect,
          urlPath: context.url,
          publicPath
        })
      }
      catch (err) {
        reject(err)
        return
      }
    }

    if (hasRedirected === true) {
      return
    }
    

    const
      url = context.url,
      { fullPath } = router.resolve(url).route

    if (fullPath !== url) {
      return reject({ url: fullPath })
    }

    // set router's location
    router.push(url).catch(() => {})

    // wait until router has resolved possible async hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
        .map(m => m.options /* Vue.extend() */ || m)

      // no matched routes
      if (matchedComponents.length === 0) {
        return reject({ code: 404 })
      }

      

      let hasRedirected = false
      const redirect = (url, status) => {
        hasRedirected = true
        redirectBrowser(url, router, reject, status)
      }

      appOptions.preFetch !== void 0 && matchedComponents.unshift(appOptions)

      // Call preFetch hooks on components matched by the route.
      // A preFetch hook dispatches a store action and returns a Promise,
      // which is resolved when the action is complete and store state has been
      // updated.
      matchedComponents
      .filter(c => c && c.preFetch)
      .reduce(
        (promise, c) => promise.then(() => hasRedirected === false && c.preFetch({
          store,
          ssrContext: context,
          currentRoute: router.currentRoute,
          redirect,
          urlPath: context.url,
          publicPath
        })),
        Promise.resolve()
      )
      .then(() => {
        if (hasRedirected === true) { return }

        context.state = store.state

        
        const App = new Vue(app)
        context.$getMetaHTML = App.$getMetaHTML(App)
        resolve(App)
        
      })
      .catch(reject)

      
    }, reject)
  })
}
