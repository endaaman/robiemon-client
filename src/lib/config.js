import { browser } from '$app/environment'
import {
    PUBLIC_UPSTREAM_URL_BASE,
} from '$env/static/public'

export const API_BASE = browser ? '/api' : `${PUBLIC_UPSTREAM_URL_BASE}/api`
export const STATIC_BASE = '/static'
