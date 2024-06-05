import fs from 'fs'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { handler } from './build/handler.js'


const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost:3000'
const PORT = 8000

const app = express()

const proxy = createProxyMiddleware({
  target: BACKEND_HOST,
  changeOrigin: true,
})

console.log(`Proxy to http://${BACKEND_HOST}`)

app.use('/api/*', proxy)
app.use('/static', express.static('static'))
app.use(handler)

app.listen(PORT, () => {
  console.log(`start server on http://localhost:${PORT}`)
})
