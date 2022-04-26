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


import Vue from 'vue'
import createApp from './app.js'


import 'app/src-pwa/register-service-worker.js'

import { isRunningOnPWA } from './ssr-pwa'




import qboot_Bootplugins from 'boot/plugins'

import qboot_Bootfirebaseauth from 'boot/firebase-auth'

import qboot_Boothkcomponents from 'boot/hk-components'

import qboot_Bootveevalidate from 'boot/vee-validate'

import qboot_Bootvueshortkey from 'boot/vue-shortkey'



import { addPreFetchHooks } from './client-prefetch.js'





Vue.config.devtools = true
Vue.config.productionTip = false



console.info('[Quasar] Running SSR + PWA.')
console.info('[Quasar] PWA: Use devtools > Application > "Bypass for network" to not break Hot Module Replacement while developing.')



// Needed only for iOS PWAs
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && window.navigator.standalone) {
  import(/* webpackChunkName: "fastclick"  */ '@quasar/fastclick')
}


const publicPath = `/`


async function start () {
  const { app, store, router } = await createApp()

  
  // prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (isRunningOnPWA !== true && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }
  

  
  let hasRedirected = false
  const redirect = url => {
    hasRedirected = true
    const normalized = Object(url) === url
      ? router.resolve(url).route.fullPath
      : url

    window.location.href = normalized
  }

  const urlPath = window.location.href.replace(window.location.origin, '')
  const bootFiles = [qboot_Bootplugins,qboot_Bootfirebaseauth,qboot_Boothkcomponents,qboot_Bootveevalidate,qboot_Bootvueshortkey]

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
        ssrContext: null,
        redirect,
        urlPath,
        publicPath
      })
    }
    catch (err) {
      if (err && err.url) {
        window.location.href = err.url
        return
      }

      console.error('[Quasar] boot error:', err)
      return
    }
  }

  if (hasRedirected === true) {
    return
  }
  

  
    
      if (isRunningOnPWA === true) {
        
        addPreFetchHooks(router, store)
        
        new Vue(app)
      }
      else {
    
    const appInstance = new Vue(app)

    // wait until router has resolved all async before hooks
    // and async components...
    router.onReady(() => {
      
      addPreFetchHooks(router, store, publicPath)
      
      appInstance.$mount('#q-app')
    })
    
    }
    

  

}

start()
