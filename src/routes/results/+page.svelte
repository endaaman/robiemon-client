<script>
  import { browser } from '$app/environment'
  import format from 'date-fns/format'
  import { getToastStore, Table, tableSourceMapper, tableMapperValues } from '@skeletonlabs/skeleton';
  import { onMount, onDestroy, tick } from 'svelte'
  import { API_BASE } from '$lib/config'

  const toastStore = getToastStore()


  let eventSource = null
  // pending, error, connected
  let connectionStatus = 'pending'
  let tasks = []

  function openConnection() {
    eventSource = new EventSource(`${API_BASE}/status`)

    eventSource.addEventListener('open', (e) => {
      console.log('open')
      connectionStatus = 'connected'
    })

    eventSource.onmessage = function(event) {
      console.log('message')
      tasks = JSON.parse(event.data)
    }

    eventSource.onerror = function (err) {
      connectionStatus = 'error'
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

  async function handleReconnectClick() {
    openConnection()
  }

  onMount(async () => {
    openConnection()
  })

  onDestroy(async () => {
    closeConnection()
  })


  function formatDate(d) {
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
    })
    .split('/')
    .join('-');
  }

</script>

{#if connectionStatus === 'pending'}

  <p>Loading</p>

{:else if connectionStatus === 'error'}

  <p>Failed to connect server.</p>
  <p>Please notice to the system administrator.</p>
  <button class="btn variant-filled" on:click={ handleReconnectClick }>Re-connect server</button>

{:else if connectionStatus === 'connected'}

  {#if false}
  <div class="table-container">
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>image</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each tasks as task, i}
          <tr>
            <td>{ format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss') }</td>
            <td><img src={`${API_BASE}/uploads/${task.image}`} alt={task.image}/></td>
            <td>
              {#if task.status === 'done'}
                <span class="i-mdi-check"></span>
              {:else if task.status === 'processing'}
                <span class="i-mdi-loading animate-spin"></span>
              {:else if task.status === 'pending'}
                <span class="i-mdi-clock-alert-outline"></span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {/if}


  <div class="mx-auto flex flex-wrap -mx-2">
    {#each tasks as task, i}
      <div class="lg:w-1/4 md:w-1/3 sm:w-1/2 p-2">
        <a
          href="/" class="card block"
          class:opacity-75={ task.status !== 'done' }
          class:pointer-events-none={ task.status !== 'done' }
        >
          <section class="p-4">
            <img src={`${API_BASE}/uploads/${task.image}`} alt={task.timestamp} />
          </section>
          <footer class="card-footer">
            <div class="flex">
              <div class="mr-2">
                <span class="badge variant-filled">Brain tumor</span>
              </div>
              <div class="ml-auto">
                {#if task.status === 'done'}
                  <span class="i-mdi-check align-middle"></span>
                {:else if task.status === 'processing'}
                  <span class="i-mdi-loading animate-spin align-middle"></span>
                {:else if task.status === 'pending'}
                  <span class="i-mdi-clock-alert-outline align-middle"></span>
                {/if}
              </div>
            </div>
          </footer>
        </a>
      </div>
    {/each}
  </div>

{/if}
