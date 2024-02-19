<script>
	import '../app.postcss';
  import { browser } from '$app/environment'
	import { setContext, onMount, onDestroy, tick } from 'svelte'
	import { writable } from 'svelte/store'
	import {
		AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
		Avatar, LightSwitch,
	} from '@skeletonlabs/skeleton'
	import {
		Modal, Toast, Drawer,
		initializeStores, getToastStore, getModalStore, getDrawerStore, storePopup
	} from '@skeletonlabs/skeleton'
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import { page } from '$app/stores'
	import { API_BASE } from '$lib/config'
	import * as C from '$lib/const'

	import ModalPredict from '$lib/modals/predict.svelte'
	import ModalPredictMulti from '$lib/modals/predict_multi.svelte'
	import Title from '$lib/components/title.svelte'
	import Footer from '$lib/components/footer.svelte'
	import ConnectionButton from '$lib/components/connection_button.svelte'

	initializeStores()


	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow })

	const drawerStore = getDrawerStore()

	let currentToast = null
	let drawerOpen = false

	$: {
		if ($page) drawerStore.close()
	}

	drawerStore.subscribe((v) => {
		drawerOpen = v.open
	})

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
		// 	icon: 'setting',
		// 	label: 'Setting',
		// 	href: '/setting',
		// },
	]

	export let data;

	const modalRegistry = {
		predict: { ref: ModalPredict },
		predictMulti: { ref: ModalPredictMulti },
	}

	const toastStore = getToastStore()
	const modalStore = getModalStore()

	function matchHref(href, current) {
		if (href === '/') {
			return current === href
		}
		return current.startsWith(href)
	}


	let eventSource = null
  const status = writable()
	setContext('status', status)
  status.set(data.status || {tasks: [], bt_results: [], bt_weights: []})

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
							}, 500)
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


	function handleMenuClicked() {
		if (drawerOpen) {
			drawerStore.close()
		} else {
			drawerStore.open({
				id: 'menu',
				position: 'left',
				width: 'w-[280px] md:w-[480px]',
			})
		}
	}

	async function handleReconnectClick() {
		$connection.connect()
	}

	onMount(async () => {
		$connection.connect()
	})

	onDestroy(async () => {
		$connection.close()
	})

  function onKeyDown(e) {
		if (e.key === 'Escape') {
			e.preventDefault()
      console.log('close modal')
			// $modalStore[0].response(false)
			modalStore.close()
		}
  }
</script>

<svelte:window on:keydown={onKeyDown} />
<Modal components={modalRegistry} />
<Toast />

<Drawer>
	{#if $drawerStore.id === 'menu'}
		<div class="flex flex-col h-full">
			<nav class="list-nav p-4">
				<ul>
					{#each links as link}
					  <li class="my-4">
							<a
								class="btn text-lg"
								class:variant-soft-primary={ matchHref(link.href, $page.url.pathname) }
								href={link.href}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>


			<div class="mt-auto">
				<div class="flex flex-row gap-4 justify-center my-4">
					<ConnectionButton></ConnectionButton>
					<LightSwitch />
				</div>

				<hr />

				<Footer class="p-4"></Footer>
			</div>
		</div>
	{/if}
</Drawer>

<!-- <pre>{ JSON.stringify($status, 0, 2) }</pre> -->

<AppShell>
	<svelte:fragment slot="header">
		<AppBar class="hidden md:block">
			<svelte:fragment slot="lead">
				<Title></Title>
			</svelte:fragment>

			<svelte:fragment slot="trail">
				{#each links as link}
					<a
						class="btn text-lg hover:variant-soft-primary"
						class:variant-soft-primary={ matchHref(link.href, $page.url.pathname) }
						href={link.href}
					>
						<span class="i-mdi-{link.icon} align-middle"></span> {link.label}
					</a>
				{/each}

				<div class="inline-block min-h-[1em] w-px self-stretch bg-surface-300"></div>
				<ConnectionButton></ConnectionButton>
				<LightSwitch />

			</svelte:fragment>
		</AppBar>

		<AppBar class="block md:hidden">
			<svelte:fragment slot="lead">
				<Title></Title>
			</svelte:fragment>

			<svelte:fragment slot="trail">
				<button class="btn hover:variant-ringed rounded-none" on:click={ handleMenuClicked }>
					<span class="text-3xl"
						class:i-mdi-menu={!drawerOpen}
						class:i-mdi-close={drawerOpen}
					></span>
				</button>
			</svelte:fragment>
		</AppBar>

	</svelte:fragment>

	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->

  {#if $connection.status === C.CONNECTION_DISCONNECTED }
    <div class="p-4">
      <p>Failed to connect server.</p>
      <p>Please notice to the system administrator.</p>
      <button class="btn variant-filled" on:click={ handleReconnectClick }>Re-connect server</button>
    </div>
  {:else if $connection.status === C.CONNECTION_CONNECTED }
    <slot></slot>
  {/if}

	<svelte:fragment slot="pageFooter">
		<div class="hidden md:block">
			<hr>
			<Footer class="p-4"></Footer>
		</div>
	</svelte:fragment>
</AppShell>
