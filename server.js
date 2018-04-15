const Express = require('express')
const path = require('path')
const VueServerRenderer = require('vue-server-renderer')
const Webpack = require('webpack')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')

const [ webpackConfigServer, webpackConfigWeb ] = require('./webpack.config')

const app = Express()

const isProduction = process.env.NODE_ENV === 'production'

let renderer = null

const generateRenderer = (fs) => {
  if (!fs) fs = require('fs')

  const serverBundlePath = path.resolve(__dirname, './public/vue-ssr-server-bundle.json')
  const clientBundlePath = path.resolve(__dirname, './public/vue-ssr-client-manifest.json')
  const templatePath = path.resolve(__dirname, './index.template.html')

  return VueServerRenderer.createBundleRenderer(
    JSON.parse(fs.readFileSync(serverBundlePath, 'utf-8')),
    { 
      clientManifest: JSON.parse(fs.readFileSync(clientBundlePath, 'utf-8')),
      // Always read the HTML template from the filesystem.
      template: require('fs').readFileSync(templatePath, 'utf-8')
    }
  )
}

if (isProduction) {
  renderer = generateRenderer()
} else {
  const webCompiler = Webpack(webpackConfigWeb)
  const serverCompiler = Webpack(webpackConfigServer)

  const devMiddleware = WebpackDevMiddleware(webCompiler, { 
    logLevel: 'warn',
    publicPath: webpackConfigWeb.output.publicPath 
  })
  const hotMiddleware = WebpackHotMiddleware(webCompiler, { 
    heartbeat: 1000, 
    log: false 
  })

  app.use(devMiddleware)
  app.use(hotMiddleware)

  serverCompiler.outputFileSystem = devMiddleware.fileSystem

  // The webpack-dev-middleware will automatically build the assets for our web entry point.
  // Thus, we don't need to call `watch` on the above webCompiler. We do, however, need to 
  // call watch our serverCompiler to ensure that both the server and client stay in sync.
  webCompiler.hooks.afterEmit.tap('Web Compilation', (stats) => {
    console.info(`*** WEB COMPILATION COMPLETE ***\n`)
    console.group('Generated Assets')
    Object.keys(stats.assets).forEach(a => console.info(a))
    console.groupEnd()

    serverCompiler.run((err, stats) => {
      console.info(`\n*** SERVER COMPILATION COMPLETE *** \n`)
      console.group('Generated Assets')
      Object.keys(stats.compilation.assets).forEach(a => console.info(a))
      console.groupEnd()

      renderer = generateRenderer(devMiddleware.fileSystem)
    })
  })
}

app.use('/public/', Express.static('public'))

app.get('*', (req, res) => { 
  if (!renderer) {
    res.status(500).send('Renderer is being created, one moment....')
    return
  }

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