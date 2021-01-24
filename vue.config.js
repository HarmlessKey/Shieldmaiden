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
  ]
}
