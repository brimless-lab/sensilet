module.exports = {
  productionSourceMap:false,
  css:{
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#527195',
            'border-radius-base':"10px",
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  lintOnSave: false,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/main.js',
      title: 'Popup'
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js'
            ]
          }
        }
      }
    }
  },
}
