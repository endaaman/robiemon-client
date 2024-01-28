import { dev } from '$app/environment';
import { API_BASE } from '$lib/config'

export async function load({ fetch }) {
	if (dev) {
		return
	}
	const response = await fetch(`${API_BASE}/status`);
	const status = await response.json()
	return {
		status
	}
}
