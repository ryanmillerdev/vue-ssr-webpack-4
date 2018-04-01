const Path = require('path')
const Webpack = require('webpack')
const merge = require('webpack-merge')
const WebpackNodeExternals = require('webpack-node-externals')

const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const env = process.env.NODE_ENV

const base = {
  mode: env === 'production' ? 'production' : 'development',
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/]
      }
    }]
  },
  output: {
    path: Path.resolve(__dirname, './public'),
    publicPath: '/public/',
    filename: "[name].[hash].js"
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      "@": Path.resolve(__dirname, 'app')
    },
    extensions: ['.js', '.ts', '.vue', '.json']
  }
}

const web = merge(base, {
  target: 'web',
  devtool: 'source-map',
  entry: ["./app/entry-web.ts"],
  plugins: [
    new VueSSRClientPlugin()
  ]
})

if (env === 'production') {
  
} else {
  web.entry.unshift('webpack-hot-middleware/client?quiet=true&reload=true')
  web.plugins.push(new Webpack.HotModuleReplacementPlugin())
  web.plugins.push(new Webpack.NoEmitOnErrorsPlugin())
}

const server =  merge(base, {
  target: 'node',
  entry: ["./app/entry-node.ts"],
  externals: WebpackNodeExternals({
    whitelist: ['vue', 'vue-router']
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

module.exports = [web, server] 