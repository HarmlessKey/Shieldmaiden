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



import Vue from 'vue'
import './import-quasar.js'


import { Quasar } from 'quasar'

import { isRunningOnPWA } from './ssr-pwa'



import App from 'app/src/App.vue'


import createStore from 'app/src/store/index'

import createRouter from 'app/src/router/index'




export default async function (ssrContext) {
  // create store and router instances
  
  const store = typeof createStore === 'function'
    ? await createStore({Vue, ssrContext})
    : createStore
  
  const router = typeof createRouter === 'function'
    ? await createRouter({Vue, ssrContext, store})
    : createRouter
  
  // make router instance available in store
  store.$router = router
  

  // Create the app instantiation Object.
  // Here we inject the router, store to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = {
    router,
    store,
    render: h => h(App)
  }


  
    
  if (isRunningOnPWA === true) {
    app.el = '#q-app'
  }
  else {
    Quasar.ssrUpdate({ app, ssr: ssrContext })
  }
    
  

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return {
    app,
    store,
    router
  }
}