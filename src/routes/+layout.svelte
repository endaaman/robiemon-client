<script>
	import '../app.postcss';
  import { browser } from '$app/environment'
	import { setContext, onMount, onDestroy, tick } from 'svelte'
	import { writable } from 'svelte/store'
	import {
		AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
		Avatar, LightSwitch, popup,
	} from '@skeletonlabs/skeleton'
	import { initializeStores, Modal, Toast, getToastStore, storePopup } from '@skeletonlabs/skeleton'
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import { page } from '$app/stores'
	import { API_BASE } from '$lib/config'
	import * as C from '$lib/const'

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow })

	import ModalPredict from '$lib/modals/predict.svelte'


	const links = [
		{
			icon: 'home',
			label: 'Home',
			href: '/',
		},
		// {
		// 	icon: 'predict',
		// 	label: 'Predict',
		// 	href: '/predict',
		// },
		{
			icon: 'table',
			label: 'Result',
			href: '/results',
		},
		// {
		// 	icon: 'info',
		// 	label: 'About',
		// 	href: '/about',
		// },
	]

	initializeStores()

	export let data;

	const modalRegistry = {
		predict: { ref: ModalPredict },
	}

	const toastStore = getToastStore()

	function matchHref(href, current) {
		if (href === '/') {
			return current === href
		}
		return current.startsWith(href)
	}


	let eventSource = null
  const status = writable()
	setContext('status', status)
  status.set(data.status || {tasks: [], bt_results: []})

	let currentToast = null

  const connection = writable()
  setContext('connection', connection),
  // pending, error, connected
	connection.set({
		status: C.CONNECTION_PENDING,
		connect() {
			if (currentToast) {
				toastStore.close(currentToast)
				currentToast = null
			}
			eventSource = new EventSource(`${API_BASE}/status_sse`)

			eventSource.addEventListener('open', (e) => {
				$connection.status = C.CONNECTION_CONNECTED

				toastStore.trigger({
					message: 'Connected to the AI server',
					background: 'variant-filled-primary',
					timeout: 2000,
					autohide: true,
				})
			})

			eventSource.onmessage = function(event) {
				console.log('status updated')
				const data = JSON.parse(event.data)
				status.set(data)
				console.log(data)
			}

			eventSource.onerror = async function (err) {
				console.error('EventSource failed:', err)
				$connection.close()

				currentToast = toastStore.trigger({
					message: 'Failed to connect server.',
					background: 'variant-filled-error',
					autohide: false,
					hideDismiss: false,
					action: {
						label: 'Re-connect',
						response: async () => {
							setTimeout(() => {
								$connection.connect()
							}, 1000)
						}
					},
					callback({id, status}) {
						// if (status === 'closed') {
						// 	currentToast = null
						// }
						// console.log(id, status)
					}
				})
			}
		},
		close() {
			if (eventSource) {
				eventSource.close()
				eventSource = null
			}
			$connection.status = C.CONNECTION_DISCONNECTED
		}
	})

	onMount(async () => {
		$connection.connect()
	})

	onDestroy(async () => {
		$connection.close()
	})
</script>

<Modal components={modalRegistry} />
<Toast />

<!-- <pre>{ JSON.stringify($status, 0, 2) }</pre> -->

<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/" class="flex justify-left gap-4 align-middle text-xl items-center">
					<Avatar src="/oharobi.png" width="w-12" rounded="rounded-full" />
					<strong>
						<span class="block md:inline">ロビえもん</span>
						<span class="hidden md:inline mx-1">-</span>
						<span class="block md:inline">AI病理診断システム</span>
					</strong>
				</a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#each links as link}
					<a
						class="btn text-lg hover:variant-ghost"
						class:variant-ghost={ matchHref(link.href, $page.url.pathname) }
						href={link.href}
					>
						<span class="i-mdi-{link.icon} align-middle"></span> {link.label}
					</a>
				{/each}

				<div class="inline-block min-h-[1em] w-px self-stretch bg-surface-300"></div>

				{#if $connection.status === C.CONNECTION_CONNECTED}
					<button class="btn btn-sm variant-ringed-primary" use:popup={{
						event: 'hover',
						target: 'popupHover',
						placement: 'top'
					}}>
						<span class="i-mdi-lan-check text-primary-500"></span>
					</button>
					<div class="card p-4 variant-filled-surface" data-popup="popupHover">
						<p>Connected to the AI server.</p>
						<div class="arrow variant-filled-surface" />
					</div>
				{:else}
					<button class="btn btn-sm variant-ringed-error" use:popup={{
						event: 'hover',
						target: 'popupHover',
						placement: 'top'
					}} on:click={ $connection.connect() }>
						<span class="i-mdi-lan-disconnect text-error-500"></span>
					</button>
					<div class="card p-4 variant-filled-surface" data-popup="popupHover">
						<p>Click to try to connect the AI server again</p>
						<div class="arrow variant-filled-surface" />
					</div>
				{/if}

				<LightSwitch />

			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->

  <slot />

	<svelte:fragment slot="pageFooter">
		<hr />
		<div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
			<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
				(C) Department of Cancer Pathology, Faculty of Medicine, Hokkaido University All rights reserverd.
			</span>
			<!--
			<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
				<li>
					<a href="#" class="hover:underline me-4 md:me-6">About</a>
				</li>
				<li>
					<a href="#" class="hover:underline me-4 md:me-6">Privacy Policy</a>
				</li>
				<li>
					<a href="#" class="hover:underline me-4 md:me-6">Licensing</a>
				</li>
				<li>
					<a href="#" class="hover:underline">Contact</a>
				</li>
			</ul>
			-->
		</div>
	</svelte:fragment>
</AppShell>
