const Express = require('express')
const FS = require('fs')
const VueServerRenderer = require('vue-server-renderer')
const Webpack = require('webpack')

const webpackConfig = require('./webpack.config')

const app = Express()

const isProduction = process.env.NODE_ENV === 'production'

const generateRenderer = () => VueServerRenderer.createBundleRenderer(
  JSON.parse(require('fs').readFileSync('./public/vue-ssr-server-bundle.json', 'utf-8')),
  { 
    clientManifest: JSON.parse(require('fs').readFileSync('./public/vue-ssr-client-manifest.json', 'utf-8')),
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
  }
)

let renderer = generateRenderer()

if (!isProduction) {
  Webpack(webpackConfig).watch({}, (err, stats) => { 
    console.info(`Regenerated: ${Object.keys(stats.stats[0].compilation.assets)}`)
    renderer = generateRenderer()
  })
}

app.use('/public', Express.static('public'))

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