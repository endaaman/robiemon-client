<script>
  import format from 'date-fns/format'
  import chroma from 'chroma-js'
  import { goto } from '$app/navigation';
	import { page } from '$app/stores'
  import { getContext  } from 'svelte'
  import {
    SlideToggle, RangeSlider, RadioGroup, RadioItem, ConicGradient, ListBox, ListBoxItem,
    getModalStore, getToastStore,
    popup
  } from '@skeletonlabs/skeleton'
  import { API_BASE } from '$lib/config'

  const status = getContext('status')
  const modalStore = getModalStore()
  const toastStore = getToastStore()

  export let data

  let sort = data.sort
  let mode = data.mode

  const labels = ['L', 'M', 'G', 'B']

  const labelColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#AC64AD',
  ]

  function resultToConic(result) {
    let last = 0
    return labels.map((k, i) => {
      const v = {
        label: k,
        color: labelColors[i],
        start: last,
        end: last + result[k] * 100,
      }
      last = last + result[k] * 100
      return v
    })
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
    let query = new URLSearchParams($page.url.searchParams.toString());
    if (sort === 'descending') {
      query.delete('sort');
    } else {
      query.set('sort', sort);
    }
    goto(`?${query.toString()}`)
  }

  $: {
    let query = new URLSearchParams($page.url.searchParams.toString());
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
  <div class="grid xl:grid-cols-2 gap-4 mt-2">
    {#each $status.bt_results as _result, _i}
      {@const i = sort === 'ascending' ? _i : $status.bt_results.length - 1 - _i }
      {@const result = $status.bt_results[i]}

      <a class="card flex flex-wrap grow" href="/">
        <section class="p-4 w-2/3 flex justify-center items-center ">
          <img
            src={`${API_BASE}/uploads/${result.original_image}`}
            alt={result.timestamp}
            width="100%"/>
        </section>

        <section class="p-4 w-1/3 flex flex-col min-w-48">
          <h3>{ timestampToTitle(result.timestamp) }</h3>

          <hr class="my-1" />
          <div class="my-auto pt-2 pb-4">
            <ConicGradient stops={ resultToConic(result) } legend></ConicGradient>
          </div>

          <hr class="mb-1 mt-auto" />

          <div class="mt-2 flex flex-row gap-2">
            <a class="btn btn-sm variant-filled" href="/results/bt/{result.timestamp}">Show detail</a>
            <button class="btn btn-sm variant-filled-error" on:click={ handleDeleteClicked(result) }>Delete</button>
          </div>
        </section>
      </a>

    {/each}
  </div>

{:else if mode === 'table'}

  <div class="table-container mt-2">
    <table class="table table-compact ">
      <thead>
        <tr>
          <th>Timestamp</th>
          <!-- <th>Hash</th> -->
          <th>Image</th>
          <th>Prediction</th>
          <th></th>
          <th>Menu</th>
        </tr>
      </thead>
      <tbody>
        {#each $status.bt_results as _result, _i}
          {@const i = sort === 'ascending' ? _i : $status.bt_results.length - 1 - _i }
          {@const result = $status.bt_results[i]}
          <tr>
            <td>{ timestampToTitle(result.timestamp) }</td>
            <!-- <td>{result.hash}</td> -->
            <td>
              <img
                src={`${API_BASE}/uploads/${result.original_image}`}
                alt={result.timestamp}
                class="h-32"
              />
            </td>
            <td>
              <ConicGradient stops={ resultToConic(result) }></ConicGradient>
            </td>
            <td class="items-center align-middle">
              <ul>
                {#each labels as label, j}
                  <li class="flex items-center align-middle p-1">
                    <div class="w-4 h-4 rounded-full mr-2" style="background-color: {labelColors[j]};"></div>
                    <span class="w-4">{label}</span>
                    <span>{ parseInt(result[label] * 100) }%</span>
                  </li>
                {/each}
              </ul>
            </td>
            <td>
              <button class="btn btn-sm variant-filled" use:popup={{
                  event: 'click',
                  target: `popup${result.id}`,
                  placement: 'bottom',
                }}>
                <span class="i-mdi-dots-horizontal"></span>
              </button>
              <div data-popup={`popup${result.id}`} class="card w-48 shadow-xl">
                <div class="btn-group-vertical variant-filled w-full ">
                  <button>Detail</button>
                  <button>Delete</button>
                </div>
                <div class="arrow bg-surface-800-100-token" />
              </div>
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
