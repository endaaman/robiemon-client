<script>
  import '../app.postcss';
  import { browser } from '$app/environment'
  import { setContext, onMount, onDestroy, tick } from 'svelte'
  import { writable } from 'svelte/store'
  import { fade } from 'svelte/transition'
  import {
    AppShell, AppBar, LightSwitch,
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
  import ModalUMAP from '$lib/modals/umap.svelte'
  import Title from '$lib/components/title.svelte'
  import Footer from '$lib/components/footer.svelte'
  import ConnectionButton from '$lib/components/connection_button.svelte'

  export let data;

  if (browser) {
    document.querySelector('html').className = 'light'
		if (!('modeCurrent' in localStorage)) {
      localStorage.setItem('modeCurrent', true)
		}
  }

  initializeStores()

  // MODAL
  const modalStore = getModalStore()
  const modalRegistry = {
    predict: { ref: ModalPredict },
    predictMulti: { ref: ModalPredictMulti },
    umap: { ref: ModalUMAP },
  }

  // TOAST
  const toastStore = getToastStore()
  let currentToast = null

  // POPUP
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow })

  // DRAWER
  let drawerOpen = false
  const drawerStore = getDrawerStore()
  drawerStore.subscribe((v) => {
    drawerOpen = v.open
  })
  $: if ($page) drawerStore.close()

  const links = [
    {
      icon: 'home',
      label: 'Home',
      href: '/',
    },
    // {
    //  icon: 'predict',
    //  label: 'Predict',
    //  href: '/predict',
    // },
    {
      icon: 'table',
      label: 'Result',
      href: '/results',
    },
    // {
    //  icon: 'setting',
    //  label: 'Setting',
    //  href: '/setting',
    // },
  ]

  function matchHref(href, current) {
    if (href === '/') {
      return current === href
    }
    return current.startsWith(href)
  }

  let loading = false

  setContext('currentCameraId', writable(null))

  const status = writable(data.status || {tasks: [], bt_results: [], bt_models: []})
  setContext('status', status)


  let eventSource = null

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

      eventSource.onopen = (e) => {
        $connection.status = C.CONNECTION_CONNECTED

        toastStore.trigger({
          message: 'Connected to the AI server',
          background: 'variant-filled-primary',
          timeout: 2000,
          autohide: true,
        })
      }

      eventSource.onmessage = function(event) {
        loading = true
        const data = JSON.parse(event.data)
        status.set(data)
        console.log('status updated', data)
        setTimeout(function() {
          loading = false
        }, 1000)
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
            //  currentToast = null
            // }
            // console.log(id, status)
          }
        })
      }
    },
    close() {
      if (eventSource) {
        eventSource.close()
        eventSource.onopen = null
        eventSource.onmessage = null
        eventSource.onerror = null
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

  function handleClickConnect() {
    if ($connection.status === C.CONNECTION_CONNECTED) {
      $connection.close()
      return
    }
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
      // $modalStore[0].response(false)
      modalStore.close()
    }
  }
</script>

<style global>
</style>

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
          <ConnectionButton handler={ handleClickConnect }></ConnectionButton>
          <LightSwitch />
        </div>

        <hr />

        <Footer class="p-4"></Footer>
      </div>
    </div>
  {/if}
</Drawer>

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
        <ConnectionButton handler={ handleClickConnect } { loading }></ConnectionButton>
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
      <button class="btn variant-filled" on:click={ $connection.connect() }>Re-connect server</button>
    </div>
  {:else }
    <slot></slot>
  {/if}

  <svelte:fragment slot="pageFooter">
    <div class="hidden md:block relative">
      <hr>
      <Footer class="p-4"></Footer>
    </div>
  </svelte:fragment>
</AppShell>
