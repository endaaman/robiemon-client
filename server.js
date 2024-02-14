import fs from 'fs'
import https from 'https'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { handler } from './build/handler.js'


const app = express()

const CERT_FILE = './ssl/oreore.crt'
const KEY_FILE = './ssl/localhost.key'

let https_server = null
if(fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)){
  https_server = https.createServer({
    key: fs.readFileSync(KEY_FILE),
    cert: fs.readFileSync(CERT_FILE)
  }, app)
}

const proxy = createProxyMiddleware({
  target: process.env.PUBLIC_UPSTREAM_URL_BASE,
  changeOrigin: true,
})

console.log(`PROXY TO: "${process.env.PUBLIC_UPSTREAM_URL_BASE}"`, )

const port = process.env.PORT || 8000

app.use('/api/*', proxy)
app.use('/static/*', proxy)
app.use(handler)

const s = https_server ? https_server : app
s.listen(port, () => {
  console.log(`listening on port ${port}`)
})
