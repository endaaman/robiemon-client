import { browser } from '$app/environment'
import { dev } from '$app/environment';
import { API_BASE } from '$lib/config'

export async function load({ fetch }) {
  const response = await fetch(`${API_BASE}/status`);
  const status = await response.json()
  return { status }
}

export const csr = true
export const ssr = true
