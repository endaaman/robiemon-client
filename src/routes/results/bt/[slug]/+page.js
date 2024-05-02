import { error } from '@sveltejs/kit'
import { API_BASE } from '$lib/config'

export async function load({ fetch, params }) {
  const r = await fetch(`${API_BASE}/bt/results/${params.slug}`)
  // console.log('load', r)
  if (!r.ok) {
    error(r.status)
  }
  return { result: await r.json() }
}

export const ssr = false
export const csr = true
