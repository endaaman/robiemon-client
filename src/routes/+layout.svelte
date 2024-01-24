<script>
	import '../app.postcss';
	import { setContext, onMount, onDestroy } from 'svelte'
	import { writable } from 'svelte/store'
	import {
		AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
		Avatar, LightSwitch,
	} from '@skeletonlabs/skeleton'
	import { initializeStores, Modal, Toast, getToastStore  } from '@skeletonlabs/skeleton'
	import { page } from '$app/stores'
  import { API_BASE } from '$lib/config'

	import ModalPredict from './modals/predict.svelte'


	const links = [
		{
			icon: 'home',
			label: 'Home',
			href: '/',
			// match: () => $page.url.pathname == '/',
			match: () => $page.route.id === '/',
		},
		{
			icon: 'table',
			label: 'Result',
			href: '/results',
			// match: () => $page.url.pathname == '/results',
			match: () => $page.route.id.startsWith('/results'),
		},
		{
			icon: 'info',
			label: 'About',
			href: '/about',
			// match: () => $page.url.pathname == '/about',
			match: () => false,
		},
	]

	initializeStores()

	const modalRegistry = {
		predict: { ref: ModalPredict },
	}

	const toastStore = getToastStore()

	function matchHref(link, current) {
		if (current === '/') {
			if (link.href === '/') {
				return true
			}
		}
		return current.startsWith(link)
	}


  let eventSource = null

  const status = writable()
	setContext('status', status)
  status.set({tasks: [], bt_results: []})

  const connectionStatus = writable()
  setContext('connectionStatus', connectionStatus)
  // pending, error, connected
	connectionStatus.set('pending')

  function openConnection() {
    eventSource = new EventSource(`${API_BASE}/status_sse`)

    eventSource.addEventListener('open', (e) => {
      console.log('open')
      connectionStatus.set('connected')
    })

    eventSource.onmessage = function(event) {
      console.log('onmessage')
      const data = JSON.parse(event.data)
			status.set(data)
			console.log(data)
    }

    eventSource.onerror = function (err) {
      connectionStatus.set('error')
      console.error('EventSource failed:', err)
      closeConnection()

      toastStore.trigger({
        message: 'Error: Failed to connect server.',
        timeout: 5000,
        background: 'variant-filled-error',
      })
    }
  }

  function closeConnection() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  onMount(async () => {
    openConnection()
  })

  onDestroy(async () => {
    closeConnection()
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
						class:variant-ghost={ matchHref(link, $page.route.id) }
						href={link.href}
					>
						<span class="i-mdi-{link.icon} align-middle"></span> {link.label}
					</a>
				{/each}

				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!--
	<svelte:fragment slot="sidebarLeft">
		<AppRail>
			<AppRailTile bind:group={selectedTarget} name="tile-bt" value="bt" title="tile-bt">
				<svelte:fragment slot="lead">
					<span class="i-mdi-brain"></span>
				</svelte:fragment>
				<span>Brain tumor</span>
			</AppRailTile>

			<AppRailTile bind:group={selectedTarget} name="tile-eosino" value="eosino" title="tile-eosino">
				<svelte:fragment slot="lead">
					<span class="i-mdi-bacteria-outline"></span>
				</svelte:fragment>
				<span>Eosino</span>
			</AppRailTile>
		</AppRail>
	</svelte:fragment>
	-->

	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->

	<div class="p-4">
		<slot />
	</div>

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
