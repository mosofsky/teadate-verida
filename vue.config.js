// vue.config.js

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
 module.exports = {
    devServer: {
        clientLogLevel: 'info',
        open: true,
    },
    pages: {
      index: {
        // entry for the page
        entry: 'src/main.ts',
        title: process.env.VUE_APP_CONTEXT_NAME,
      },
    }
  }
  