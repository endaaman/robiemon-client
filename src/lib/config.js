import { browser } from '$app/environment'
import {
    PUBLIC_SERVER_API_BASE,
    PUBLIC_BROWSER_API_BASE,
    PUBLIC_STATIC_BASE,
} from '$env/static/public'

export const API_BASE = browser ? PUBLIC_BROWSER_API_BASE : PUBLIC_SERVER_API_BASE
export const STATIC_BASE = PUBLIC_STATIC_BASE
