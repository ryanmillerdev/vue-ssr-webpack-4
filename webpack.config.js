const Path = require('path')
const Webpack = require('webpack')
const merge = require('webpack-merge')
const WebpackNodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const env = process.env.NODE_ENV
const isProduction = env === 'production'

const base = {
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]
    }, {
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
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    }),
    new VueLoaderPlugin()
  ],
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
  devtool: isProduction ? false : 'source-map',
  entry: '@/entry-web.js',
  plugins: [
    new VueSSRClientPlugin()
  ]
})

const server =  merge(base, {
  target: 'node',
  entry: ["./app/entry-server.js"],
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

module.exports = [server, web]  