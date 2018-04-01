const Express = require('express')
const FS = require('fs')
const MFS = require('memory-fs')
const VueServerRenderer = require('vue-server-renderer')
const Webpack = require('webpack')
const WebpackDevMiddleware = require('webpack-hot-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')

const [
  webpackConfigWeb, 
  webpackConfigServer
] = require('./webpack.config')


const app = Express()
const env = process.env.NODE_ENV

let renderer

if (env === 'production') {
  renderer = VueServerRenderer.createBundleRenderer(
    require('./public/vue-ssr-server-bundle.json'), 
    { 
      clientManifest: require('./public/vue-ssr-client-manifest.json'),
      template: require('fs').readFileSync('./index.template.html', 'utf-8')
    }
  )
} else {
  const clientCompiler = Webpack(webpackConfigWeb)
  const serverCompiler = Webpack(webpackConfigServer)

  // Save updated bundles to memory for increased performance.
  // const mfs = new MFS()
  // serverCompiler.outputFileSystem = mfs

  // Leverage Webpack Development Packages
  app.use(WebpackDevMiddleware(clientCompiler, {
    publicPath: webpackConfigWeb.output.publicPath
  }))

  app.use(WebpackHotMiddleware(clientCompiler, {
    log: false,
    heartbeat: 1000
  }))

  clientCompiler.watch({}, err => {
    console.info('Regenerating renderer based on server reload!')

    renderer = VueServerRenderer.createBundleRenderer(
      JSON.parse(require('fs').readFileSync('./public/vue-ssr-server-bundle.json', 'utf-8')),
      { 
        clientManifest: JSON.parse(require('fs').readFileSync('./public/vue-ssr-client-manifest.json', 'utf-8')),
        template: require('fs').readFileSync('./index.template.html', 'utf-8')
      }
    )
  }) 
  
  serverCompiler.watch({}, err => {
    console.info('Regenerating renderer based on server reload!')

    renderer = VueServerRenderer.createBundleRenderer(
      JSON.parse(require('fs').readFileSync('./public/vue-ssr-server-bundle.json', 'utf-8')),
      { 
        clientManifest: JSON.parse(require('fs').readFileSync('./public/vue-ssr-client-manifest.json', 'utf-8')),
        template: require('fs').readFileSync('./index.template.html', 'utf-8')
      }
    )
  })
}

app.use('/public', Express.static('public'))

app.get('*', (req, res) => { 
  if (renderer === undefined) {
    res.send('Renderer is preparing...')
    return
  }

  renderer.renderToStream({ url: req.url })
    .on('error', (err) => {
      if (err.message === '404') {
        res.status(404).send()
      } else {
        console.log(err)
        res.status(500).send()
      }
    }).pipe(res)
})

app.listen(process.env.PORT || 8070)