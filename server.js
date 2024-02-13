import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { handler } from './build/handler.js'

const app = express()
const proxy = createProxyMiddleware({
  target: process.env.PUBLIC_UPSTREAM_URL_BASE,
  changeOrigin: true,
})

console.log(`PROXY TO: "${process.env.PUBLIC_UPSTREAM_URL_BASE}"`, )

const port = 5174

app.use('/api/*', proxy)
app.use('/static/*', proxy)
app.use(handler)
app.listen(port, () => {
	console.log(`listening on port ${port}`)
})
