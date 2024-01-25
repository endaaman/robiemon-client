<script>
  import format from 'date-fns/format'
  import { onMount, onDestroy, tick, setContext, getContext  } from 'svelte'
	import { writable } from 'svelte/store'
  import { getToastStore, Table, tableSourceMapper, tableMapperValues } from '@skeletonlabs/skeleton';
  import { API_BASE } from '$lib/config'
	import { page } from '$app/stores'
  import { browser } from '$app/environment'

  const toastStore = getToastStore()

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

  const status = getContext('status')

  function handleReconnectClick() {
    console.log('reconnecr')
  }
</script>


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
  {#each $status.tasks as task, i}
    <div class="lg:w-1/4 md:w-1/3 sm:w-1/2 p-2">
      <a
        href="/results/{task.mode}/{task.timestamp}" class="card block"
        class:opacity-75={ task.status === 'pending' }
        class:pointer-events-none={ task.status !== 'done' }
      >
        <header class="card-header">
          <!-- <h3 class="text-sm">{format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')}</h3> -->
          <h3 clas="text-sm">
            {format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')} -
            {task.tag}
          </h3>
        </header>
        <section class="px-4 py-2">
          <img src={`${API_BASE}/uploads/${task.image}`} alt={task.timestamp} />
        </section>
        <footer class="card-footer">
          <div class="flex">
            <div class="mr-2">
              <span class="badge variant-filled">Brain tumor</span>
            </div>
            <div class="ml-auto">
              {#if task.status === 'pending'}
                <span class="badge variant-ringed">
                  Pending <span class="i-mdi-clock-alert-outline align-middle ml-1"></span>
                </span>
              {:else if task.status === 'processing'}
                <span class="badge variant-ringed">
                  Processing <span class="i-mdi-loading animate-spin align-middle ml-1"></span>
                </span>
              {:else if task.status === 'done'}
                <span class="badge variant-ringed">
                  Done <span class="i-mdi-check align-middle ml-1"></span>
                </span>
              {:else if task.status === 'too_large'}
                <span class="badge variant-ringed-warning text-warning-500">
                  Too Large <span class="i-mdi-warning-outline align-middle ml-1"></span>
                </span>
              {:else if task.status === 'error'}
                <span class="badge variant-ringed-error text-error-500">
                  Error <span class="i-mdi-error-outline align-middle ml-1"></span>
                </span>
              {/if}
            </div>
          </div>
        </footer>
      </a>
    </div>
  {/each}
</div>
