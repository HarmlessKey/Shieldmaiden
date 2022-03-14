/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v1.quasar.dev/quasar-cli/quasar-conf-js
/* eslint-env node */
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = function (/* ctx */) {
  return {
    // https://v1.quasar.dev/quasar-cli/supporting-ts
    supportTS: true,

    // https://v1.quasar.dev/quasar-cli/prefetch-feature
    preFetch: false,

    // app boot file (src/boot)
    // --> boot files are part of "main.js"
    // https://v1.quasar.dev/quasar-cli/boot-files
    boot: [
      'plugins',
      'firebase-auth',
      'hk-components',
      'vee-validate',
      { path: "vue-shortkey", server: false }
    ],

    // https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'styles.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: 'history', // available values: 'hash', 'history'
      env: require('dotenv').config().parsed,
      scssLoaderOptions: {
        additionalData: '@import "src/css/variables.scss";'
      },

      transpile: true,

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      transpileDependencies: [
        'vee-validate/dist/rules',
        'vue-numeral-filter'
      ],

      // rtl: false, // https://v1.quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v1.quasar.dev/quasar-cli/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpack (chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: [ 'js', 'vue' ] }])
      },
    },

    // Full list of options: https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 8080,
      open: true // opens browser window automatically
    },

    // https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'en-us', // Quasar language pack
      config: {},

      // Possible values for "importStrategy":
      // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
      // * 'all'  - Manually specify what to import
      importStrategy: 'auto',

      // For special cases outside of where "auto" importStrategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'AppFullscreen',
        'Notify'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://v1.quasar.dev/options/animations
    animations: [],

    // https://v1.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: true
    },

    // https://v1.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: "GenerateSW", // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW
      manifest: {
        name: "Harmless Key",
        short_name: "Harmless Key",
        start_url: ".",
        description: "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.",
        orientation: "portrait",
        theme_color: "#191a1c",
        background_color: "#191a1c",
        display: "standalone",
        categories: [
          "games",
          "entertainment"
        ],
        icons: [
          {
            src: "img/icons/transparent-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "img/icons/transparent-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "img/icons/ms/app-icon-44x44.png",
            sizes: "44x44",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/ms/small-tile-71x71.png",
            sizes: "71x71",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/ms/wide-tile-350x150.png",
            sizes: "350x150",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/ms/large-tile-310x310.png",
            sizes: "310x310",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/ms/store-logo-50x50.png",
            sizes: "50x50",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/ms/splash-screen-620x300.png",
            sizes: "620x300",
            type: "image/png",
            purpose: "any"
          }
        ],
        shortcuts: [
          {
            name: "Campaigns",
            description: "The campaigns you are running.",
            url: "/content/campaigns",
            icons: [
              {
                src: "/img/icons/shortcuts/campaigns-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
              }
            ]
          },
          {
            name: "Characters",
            description: "Your player characters.",
            url: "/content/characters",
            icons: [
              {
                src: "/img/icons/shortcuts/characters-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
              }
            ]
          }
        ]
      }
    },

    // Full list of options: https://v1.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v1.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v1.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'hkq'
      },

      // More info: https://v1.quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,

      extendWebpack (cfg) {
        // cfg.resolve.alias = {
        //   ...cfg.resolve.alias,
        //   '@': path.resolve(__dirname, './src')
        // }    
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      }
    }
  }
}
