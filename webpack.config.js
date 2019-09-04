// ******************************
// Dependencies
// ******************************

// Core module - allows us to obtain absolute paths.
const Path = require('path')

// Supported by Vue Loader 15 and, unlike ExtractTextPlugin, works with Webpack 4 seamlessly.
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// Allows Webpack to parse *.vue files. Note the new import signature.
const { VueLoaderPlugin } = require('vue-loader')

// Takes our *.vue files and other web assets and bundles them.
const Webpack = require('webpack')

// Allows us to intelligently merge Webpack configuration objects.
const WebpackMerge = require('webpack-merge')

// Allows us to exclude Node.js dependencies from the built server bundle, making build times
// much, much faster.
const WebpackNodeExternals = require('webpack-node-externals')

// The Vue SSR client plugin generates a `client-manifest` which allows Vue to make better decisions
// about how and what to render client-side, but TBH it's all a mystery to me.
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

// Beyond Webpack and Vue itself, this one of the most important dependencies. The Vue SSR server
// plugin generates a `server-manifest` which is used instruct the rendering engine exactly what to
// return when a web request is made. But again, the internals of this plugin are a mystery to me
// as well.
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

// ******************************
// Convenience Utils
// ******************************

const env = process.env.NODE_ENV
const isProduction = env === 'production'

// ******************************
// Base Webpack Configuration
// ******************************

// This configuration contains general properties relevant to both our server and client assets.
// It's used by both of the configuration objects returned from this module.
const base = {
  // This property is required as of Webpack 4. If it's not set, you'll catch heat.
  // Learn more: https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [{
      // As mentioned above, transforms *.vue components into their component elements.
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      // Per goal #1 above, I wanted to be able to extract my CSS file separately. The prescribed
      // means of doing this (in Vue Loader 14) is via the ExtractTextWebpackPlugin:
      // (https://vue-loader.vuejs.org/en/configurations/extract-css.html)
      //
      // In a sad turn of fate, ExtractTextWebpackPlugin did not gracefully make the transition
      // to Webpack 4. Vue Loader 15 adds support for alternative CSS extractors, and you can
      // read more here: https://github.com/vuejs/vue-loader/issues/1220.
      //
      // And to further complicate things, MiniCssExtractPlugin does not support HMR (yet), and so
      // to work around that we use `vue-style-loader` and `css-loader` in development, which does
      // support HMR and injects styles directly into the <head> via <style> tags versus generating
      // a hashed CSS file.
      //
      // Why `vue-style-loader` and not `style-loader`, the which is fully support by the Webpack
      // community? The core issue is that the former is isomorphic while the latter isn't, meaning
      // that if we try to use `style-loader` on the server then we get mysterious errors, such as
      // `window is not defined`.  Read more here: https://github.com/vuejs/vue-style-loader.
      test: /\.css$/,
      use: isProduction ? [
        MiniCssExtractPlugin.loader,
        'css-loader'
       ] : [
        'vue-style-loader',
        'css-loader'
       ]
    }, {
      // File loader simply takes a file a puts it somewhere else with (optionally a new name and
      // cache-busting hash).
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: 'images/[name].[hash:8].[ext]'
      }
    }]
  },
  output: {
    path: Path.resolve(__dirname, './public'),
    publicPath: '/public/',
    filename: "[name].[hash:8].js"
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      // Ensures that the ECMAScript module flavor of Vue is imported whenenver used.
      // Thus, in `import Vue from 'vue'`, `vue` is mapped to the path below.
      'vue$': 'vue/dist/vue.esm.js',
      // A simple convenience alias to avoid nasty relative paths.
      // Thus, `../../../components/Foo.vue` might become `@/components/Foo.vue`.
      "@": Path.resolve(__dirname, './app')
    },
    // Allows Webpack to resolve *.vue files, which otherwise it wouldn't do.
    extensions: ['.js', '.vue']
  }
}

if (isProduction) {
  // See the config of the CSS loader in the base config above for the reason this is added
  // in production.
  base.plugins.unshift(new MiniCssExtractPlugin({
    filename: '[name].[hash:8].css'
  }))
}

// ****************************************
// Client-Side Webpack Configuration
// ****************************************

const web = WebpackMerge(base, {
  target: 'web',
  devtool: isProduction ? false : 'source-map',
  entry: ['@/entry-web.js'],
  plugins: [
    new VueSSRClientPlugin()
  ]
})

// In development, we want to instantly update the client if we make a change to the Vue app.
// The webpack-hot-middleware plugin let's us do just that, and here we add the necessary elements
// to the above `web` config if we're running in development mode.
if (!isProduction) {
  web.entry.unshift('webpack-hot-middleware/client?quiet=true&reload=true')
  web.plugins.push(new Webpack.HotModuleReplacementPlugin())
  web.plugins.push(new Webpack.NoEmitOnErrorsPlugin())
}

// ****************************************
// Server-Side Webpack Configuration
// ****************************************

const server =  WebpackMerge(base, {
  target: 'node',
  entry: ["./app/entry-server.js"],
  // Here we whitelist only those Node.js modules which are necessary for rendering our app.
  // Including any other modules in the server bundle slows build time and is unneccessary.
  externals: WebpackNodeExternals({
    whitelist: ['isomorphic-fetch', 'vue', 'vue-router', 'vuex']
  }),
  output: {
    // Result in the compiled module being exposed as `module.exports = ...`.
    // See https://webpack.js.org/configuration/output/#module-definition-systems
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new VueSSRServerPlugin()
  ]
})

module.exports = [server, web]
