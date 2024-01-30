<script>
  import format from 'date-fns/format'
  import { onMount, onDestroy, tick, setContext, getContext  } from 'svelte'
	import { writable } from 'svelte/store'
  import {
    getToastStore, Table,
    RadioGroup, RadioItem,
    tableSourceMapper, tableMapperValues
  } from '@skeletonlabs/skeleton';
  import { STATIC_BASE } from '$lib/config'
	import { page } from '$app/stores'
  import { browser } from '$app/environment'

  const toastStore = getToastStore()

  export let data

  let sort = data.sort

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


<RadioGroup>
  <RadioItem bind:group={sort} name="sort" value="descending">
    <span class="i-mdi-sort-descending rotate-180 align-middle text-lg"></span>
  </RadioItem>

  <RadioItem bind:group={sort} name="sort" value="ascending">
    <span class="i-mdi-sort-ascending align-middle text-lg"></span>
  </RadioItem>
</RadioGroup>

<!-- <RadioGroup> -->
<!--   <RadioItem bind:group={mode} name="mode" value="card"> -->
<!--     <span class="i-mdi-view-grid rotate-180 align-middle text-lg"></span> -->
<!--   </RadioItem> -->

<!--   <RadioItem bind:group={mode} name="mode" value="table"> -->
<!--     <span class="i-mdi-view-sequential align-middle text-lg"></span> -->
<!--   </RadioItem> -->
<!-- </RadioGroup> -->


<div class="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 auto-rows-min gap-4">
  {#if $status.tasks.length === 0}
    <p>No tasks there.</p>
  {/if}
  {#each $status.tasks as _task, _i}
    {@const i = sort === 'ascending' ? _i : $status.tasks.length - 1 - _i }
    {@const task = $status.tasks[i]}
    <a
      href="/results/{task.mode}/{task.timestamp}" class="card flex flex-col"
      class:opacity-75={ task.status === 'pending' }
      class:pointer-events-none={ task.status !== 'done' }
    >
      <header class="card-header">
        <!-- <h3 class="text-sm">{format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')}</h3> -->
        <h3 clas="text-sm">
          {format(new Date(task.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')} -
          {task.hash}
        </h3>
      </header>
      <section class="px-4 py-2 flex justify-center items-center grow max-h-96">
        <img
          src={`${STATIC_BASE}/uploads/${task.image}`}
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
  {/each}
</div>
