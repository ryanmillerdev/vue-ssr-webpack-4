const Express = require('express')
const fs = require('fs')
const path = require('path')
const VueServerRenderer = require('vue-server-renderer')
const Webpack = require('webpack')
const WebpackHotMiddleware = require('webpack-hot-middleware')

const [ webpackConfigServer, webpackConfigWeb ] = require('./webpack.config')

const app = Express()

const isProduction = process.env.NODE_ENV === 'production'

const generateRenderer = () => {
  const serverBundlePath = path.resolve(__dirname, './public/vue-ssr-server-bundle.json')
  const clientBundlePath = path.resolve(__dirname, './public/vue-ssr-client-manifest.json')
  const templatePath = path.resolve(__dirname, './index.template.html')

  return VueServerRenderer.createBundleRenderer(
    JSON.parse(fs.readFileSync(serverBundlePath, 'utf-8')),
    { 
      clientManifest: JSON.parse(fs.readFileSync(clientBundlePath, 'utf-8')),
      template: fs.readFileSync(templatePath, 'utf-8')
    }
  )
}

let renderer = generateRenderer()

if (!isProduction) {
  const webCompiler = Webpack(webpackConfigWeb)
  const serverCompiler = Webpack(webpackConfigServer)

  app.use(WebpackHotMiddleware(webCompiler, { heartbeat: 1000, log: false }))

  webCompiler.watch({}, (err, stats) => {
    console.info(`*** WEB COMPILATION COMPLETE ***`)
    console.info(Object.keys(stats.compilation.assets))
    renderer = generateRenderer()
  })

  serverCompiler.watch({}, (err, stats) => {
    console.info(`*** SERVER COMPILATION COMPLETE ***`)
    console.info(Object.keys(stats.compilation.assets))
    renderer = generateRenderer()
  })
}

app.use('/public/', Express.static('public'))

app.get('*', (req, res) => { 
  renderer.renderToStream({ url: req.url }).on('error', (err) => {
    if (err.message === '404') {
      res.status(404).send()
    } else {
      console.log(err)
      res.status(500).send()
    }
  }).pipe(res)
})

app.listen(process.env.PORT || 8070)