const path = require('path');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const prerender = require('./prerender.json');

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "~@/css/variables.scss";`
      }
    }
  },
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  transpileDependencies: [
    'quasar'
  ],
  configureWebpack: {
    plugins: [
      new PrerenderSPAPlugin({
        staticDir: path.join(__dirname, 'dist'),
        maxConcurrentRoutes: 1,
        routes: prerender,
        headless: true
      })
    ]
  }
}