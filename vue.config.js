module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  transpileDependencies: [
    'quasar'
  ],
  chainWebpack: (config) => {

    /* 
       Disable (or customize) prefetch, see:
       https://cli.vuejs.org/guide/html-and-static-assets.html#prefetch
    */
    config.plugins.delete('prefetch')

    /* 
       Configure preload to load all chunks
       NOTE: use `allChunks` instead of `all` (deprecated)
    */
    config.plugin('preload').tap((options) => {
      options[0].include = 'allChunks'
      return options
    })
  }
}
