<script>
  import format from 'date-fns/format'
  import { goto } from '$app/navigation';
	import { page } from '$app/stores'
  import { getContext  } from 'svelte'
  import {
    RadioGroup, RadioItem, ListBox, ListBoxItem,
    getModalStore, getToastStore,
    popup
  } from '@skeletonlabs/skeleton'
  import { API_BASE, STATIC_BASE } from '$lib/config'

  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

  const status = getContext('status')
  const modalStore = getModalStore()
  const toastStore = getToastStore()

  export let data

  let sort = data.sort
  let mode = data.mode

  function weightNameToLabel(weight) {
    const m = $status.models.find((m)=> m.weight === weight)
    if (m) {
      console.log(m)
      return m.label
    }
    return weight
  }

  function timestampToTitle(timestamp) {
    return format(new Date(timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')
  }

  async function handleDeleteClicked(result) {
    modalStore.trigger({
      type: 'confirm',
      title: 'Delete confirm',
      body: 'Are you sure you wish to proceed?',
      response: async (r) => {
        if (!r) {
          return
        }
        try {
          const response = await fetch(`${API_BASE}/results/bt/${result.id}`, {
            method: 'DELETE',
          })
          toastStore.trigger({
            message: `Result deleted.`,
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
        } finally {
        }
      },
    })
  }

  function withQuery(base, k, v) {
    const url = new URL(base)
    const params = url.searchParams
    params.append(k, v);
    url.search = params.toString()
    return url.toString()
  }

  $: {
    let query = new URLSearchParams($page.url.searchParams.toString())
    if (sort === 'descending') {
      query.delete('sort');
    } else {
      query.set('sort', sort);
    }
    goto(`?${query.toString()}`)
  }

  $: {
    let query = new URLSearchParams($page.url.searchParams.toString())
    if (mode === 'card') {
      query.delete('mode');
    } else {
      query.set('mode', mode);
    }
    goto(`?${query.toString()}`)
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

<RadioGroup>
  <RadioItem bind:group={mode} name="mode" value="card">
    <span class="i-mdi-view-grid rotate-180 align-middle text-lg"></span>
  </RadioItem>

  <RadioItem bind:group={mode} name="mode" value="table">
    <span class="i-mdi-view-sequential align-middle text-lg"></span>
  </RadioItem>
</RadioGroup>

{#if mode === 'card'}

  <div class="grid lg:grid-cols-2 gap-4 mt-2">
    {#each $status.bt_results as _result, _i}
      {@const i = sort === 'ascending' ? _i : $status.bt_results.length - 1 - _i }
      {@const result = $status.bt_results[i]}
      <!-- <pre>{ JSON.stringify($status.models, 0, 2) }</pre> -->
      <a href="/results/bt/{result.timestamp}" class="card flex flex-row grow relative gap-4 p-4" >
        <button
          on:click|preventDefault={ ()=> handleDeleteClicked(result) }
          class="btn btn-icon btn-icon-sm hover:variant-ringed absolute top-1 right-1"
        >
          <span class="i-mdi-close"></span>
        </button>
        <section class="xl:w-2/3 md:w-1/2 w-full flex justify-center items-center max-h-96">
          <img
            src={`${STATIC_BASE}/uploads/${result.original_image}`}
            alt={result.timestamp}
            class="object-contain block w-full h-full" />
        </section>

        <section class="xl:w-1/3 md:w-1/2 w-full flex flex-col">
          <h3>
            <span>{ result.name }</span>
            <span class="text-sm">({ timestampToTitle(result.timestamp) })</span>
          </h3>

          <hr class="my-1" />
          <div class="my-auto pt-2 pb-4 flex flex-row gap-4">
            <div class="w-2/3 sm:w-1/2 flex flex-col">
              <BtResultCircle result={ result } class="my-auto"></BtResultCircle>
            </div>
            <div class="w-1/3 sm:w-1/2">
              <BtResultPredictions result={ result }></BtResultPredictions>
            </div>
          </div>

          <hr class="my-2" />
          <div>
            {#if result.cam_image }
              <span class="chip variant-filled">With CAM</span>
            {:else}
              <span class="chip variant-filled chip-disabled">No CAM</span>
            {/if}

            <span class="chip variant-soft">{ weightNameToLabel(result.weight) }</span>
          </div>

          <!-- <hr class="mb-1 mt-auto" /> -->

          <!-- <div class="mt-2 flex flex-row gap-2"> -->
          <!--   <a class="btn btn-sm variant-filled" href="/results/bt/{result.timestamp}">Show detail</a> -->
          <!--   <button class="btn btn-sm variant-filled-error" on:click|preventDefault={ ()=> handleDeleteClicked(result) }>Delete</button> -->
          <!-- </div> -->
        </section>
      </a>

    {/each}
  </div>

{:else if mode === 'table'}

  <div class="table-container mt-2">
    <table class="table table-compact ">
      <thead>
        <tr>
          <th>ID</th>
          <th>Image</th>
          <th>PIE</th>
          <th>Predictions</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each $status.bt_results as _result, _i}
          {@const i = sort === 'ascending' ? _i : $status.bt_results.length - 1 - _i }
          {@const result = $status.bt_results[i]}
          <tr>
            <td>
              <p>{ timestampToTitle(result.timestamp) }</p>
              <p></p>
            </td>
            <!-- <td>{result.hash}</td> -->
            <td>
              <img
                src={`${STATIC_BASE}/uploads/${result.original_image}`}
                alt={result.timestamp}
                class="max-h-32"
              />
            </td>
            <td>
              <BtResultCircle result={ result }></BtResultCircle>
            </td>
            <td class="items-center align-middle">
              <BtResultPredictions result={ result }></BtResultPredictions>
            </td>
            <td>
              <a href="/results/bt/{result.timestamp}" class="btn variant-filled">Detail</a>
            </td>
            <td>
              <button type="button" on:click={()=>{ handleDeleteClicked(result) }} class="btn variant-filled-error">Delete</button>
            </td>
            <!-- <td>{result.B}</td> -->
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

{:else}

  <p>Invalid view mode</p>

{/if}
