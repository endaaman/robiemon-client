import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { handler } from './build/handler.js'

const app = express()
const proxy = createProxyMiddleware({
  target: process.env.UPSTREAM_URL_BASE,
  changeOrigin: true,
})

const port = 5173

app.use('/api/*', proxy)
app.use('/static/*', proxy)
app.use(handler)
app.listen(port, () => {
	console.log(`listening on port ${port}`)
})
