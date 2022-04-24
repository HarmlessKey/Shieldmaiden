/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 **/

const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')

const resolve = file => path.join(__dirname, file)
const template = fs.readFileSync(resolve('template.html'), 'utf-8')
const bundle = require('./quasar.server-manifest.json')
const clientManifest = require('./quasar.client-manifest.json')

const settings = {
  "pwa": true,
  "manualHydration": false,
  "componentCache": {
    "max": 1000,
    "maxAge": 900000
  },
  "debug": false,
  "publicPath": "/"
}

const doubleSlashRE = /\/\//
const { publicPath } = settings


if (process.env.DEBUG) {
  settings.debug = true
}

const rendererOptions = {
  template,
  clientManifest,
  // for component caching
  cache: new LRU(settings.componentCache),
  basedir: __dirname,
  // recommended for performance
  runInNewContext: false
}

const resolveUrl = url => url ? (publicPath + url).replace(doubleSlashRE, '/') : publicPath

// https://ssr.vuejs.org/api/#renderer-options
// https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
let renderer = createBundleRenderer(bundle, rendererOptions)

module.exports.resolveUrl = resolveUrl

module.exports.renderToString = function (opts, cb) {
  const ctx = {
    ...opts,
    url: opts.req.url
  }


  renderer.renderToString(ctx, cb)

}

module.exports.resolveWWW = function (file) {
  return resolve('www/' + file)
}

module.exports.mergeRendererOptions = function (opts) {
  renderer = createBundleRenderer(
    bundle,
    Object.assign(rendererOptions, opts)
  )
}

module.exports.settings = settings
