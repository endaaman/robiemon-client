import { browser } from '$app/environment'

let base
if (browser) {
  base = '/api'
} else {
  const host = process.env.BACKEND_HOST  || 'localhost:3000'
  base = `http://${host}/api`
}

export const API_BASE = base
export const STATIC_BASE = '/static'
