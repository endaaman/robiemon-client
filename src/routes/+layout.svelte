<script>
	import '../app.postcss';
  import { browser } from '$app/environment'
	import { setContext, onMount, onDestroy, tick } from 'svelte'
	import { writable } from 'svelte/store'
	import {
		AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
		Avatar, LightSwitch,
	} from '@skeletonlabs/skeleton'
	import { initializeStores, Modal, Toast, getToastStore  } from '@skeletonlabs/skeleton'
	import { page } from '$app/stores'
	import { API_BASE } from '$lib/config'
	import * as C from '$lib/const'

	import ModalPredict from './modals/predict.svelte'


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
		// },zza
		{
			icon: 'table',
			label: 'Result',
			href: '/results',
		},
		// {
		// 	icon: 'info',
		// 	label: 'About',
		// 	href: '/about',
		// 	// match: () => $page.url.pathname == '/about',
		// 	match: () => false,
		// },
	]

	initializeStores()

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
  status.set({tasks: [], bt_results: []})

  const connection = writable()
  setContext('connection', connection),
  // pending, error, connected
	connection.set({
		status: C.CONNECTION_PENDING,
		connect() {
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

				toastStore.trigger({
					message: 'Failed to connect server.',
					background: 'variant-filled-error',
					autohide: false,
					action: {
						label: 'Re-connect',
						response: () => {
							// do nothing here
						}
					},
					callback({id, status}) {
						if (status === 'closed') {
							setTimeout(() => {
								$connection.connect()
							}, 5000)
						}
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

<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/" class="flex justify-left gap-4 align-middle text-xl items-center">
					<Avatar src="/oharobi.png" width="w-12" rounded="rounded-full" />
					<strong>ロビえもん - AI病理診断システム</strong>
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
