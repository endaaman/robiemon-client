<script>
  import format from 'date-fns/format'
  import { goto } from '$app/navigation';
  import { onMount, onDestroy, tick, setContext, getContext  } from 'svelte'
	import { writable } from 'svelte/store'
  import {
    getToastStore, getModalStore,
    RadioGroup, RadioItem,
    tableSourceMapper, tableMapperValues
  } from '@skeletonlabs/skeleton';
  import { API_BASE, STATIC_BASE } from '$lib/config'
	import { page } from '$app/stores'
  import { browser } from '$app/environment'

  const toastStore = getToastStore()
  const modalStore = getModalStore()

  export let data
  let sort = data.sort

  const status = getContext('status')

  async function handleDeleteClicked(task) {
    modalStore.trigger({
      type: 'confirm',
      title: 'Delete confirm',
      body: 'Are you sure you wish to proceed?',
      response: async (r) => {
        if (!r) {
          return
        }
        try {
          const response = await fetch(`${API_BASE}/tasks/${task.timestamp}`, {
            method: 'DELETE',
          })
          toastStore.trigger({
            message: `Task deleted.`,
            timeout: 5000,
            background: 'variant-filled',
          })

        } catch (error) {
          console.log(error)
          toastStore.trigger({
            message: 'Error: Failed to connect server.',
            timeout: 5000,
            background: 'variant-filled-error',
          })
        }
      },
    })
  }

  $: {
    let query = new URLSearchParams($page.url.searchParams.toString())
    if (sort === 'descending') {
      query.delete('sort');
    } else {
      query.set('sort', sort);
    }
    if (browser) {
      goto(`?${query.toString()}`, { replaceState: true })
    }
  }

</script>

<style>
.disabled-card {
  pointer-events: none;
}

.disabled-card button {
  pointer-events: auto;
}
</style>

<div class="my-4 flex flex-row gap-4">
  <RadioGroup>
    <RadioItem bind:group={sort} name="sort" value="descending">
      <span class="i-mdi-sort-descending rotate-180 align-middle text-lg"></span>
    </RadioItem>

    <RadioItem bind:group={sort} name="sort" value="ascending">
      <span class="i-mdi-sort-ascending align-middle text-lg"></span>
    </RadioItem>
  </RadioGroup>
</div>

<div class="grid sm:grid-cols-2 lg:grid-cols-3 auto-rows-min gap-4">
  {#if $status.tasks.length === 0}
    <p>No tasks there.</p>
  {/if}
  {#each $status.tasks as _task, _i}
    {@const i = sort === 'ascending' ? _i : $status.tasks.length - 1 - _i }
    {@const task = $status.tasks[i]}
    <a
      href="/results/{task.mode}/{task.timestamp}" class="card flex flex-col relative"
      class:opacity-75={ task.status === 'pending' }
      class:disabled-card={ task.status !== 'done' }
    >
      <button
        on:click|preventDefault={ ()=> handleDeleteClicked(task) }
        class="btn btn-icon btn-icon-sm hover:variant-ringed absolute top-1 right-1"
      >
        <span class="i-mdi-close"></span>
      </button>

      <header class="card-header">
        <!-- <h3 class="text-sm">{format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')}</h3> -->
        <h3 clas="text-sm">
          {format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')} -
          {task.name}
        </h3>
      </header>
      <section class="px-4 py-2 flex justify-center items-center grow max-h-96">
        <img
          src={`${STATIC_BASE}/thumbs/${task.timestamp}.jpg`}
          alt={task.timestamp}
          class="h-full object-scale-down"
        />
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
                Too large <span class="i-mdi-warning-outline align-middle ml-1"></span>
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
  {/each}
</div>
