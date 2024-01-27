<script>
  import format from 'date-fns/format'
  import chroma from 'chroma-js'
  import { getContext  } from 'svelte'
  import { API_BASE } from '$lib/config'
  import {
    SlideToggle, RangeSlider, RadioGroup, RadioItem, ConicGradient,
    getModalStore, getToastStore
  } from '@skeletonlabs/skeleton'

  const status = getContext('status')
  const modalStore = getModalStore()
  const toastStore = getToastStore()

  let sortDirection = 'descending'
  let mode = 'card'

  const bgColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#AC64AD',
  ]

  function resultToConic(result) {
    const keys = ['L', 'M', 'G', 'B']
    let last = 0
    return keys.map((k, i) => {
      const v = {
        label: k,
        color: bgColors[i],
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

</script>

<RadioGroup>
  <RadioItem bind:group={sortDirection} name="sort" value="descending">
    <span class="i-mdi-sort-descending rotate-180 align-middle text-lg"></span>
  </RadioItem>

  <RadioItem bind:group={sortDirection} name="sort" value="ascending">
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

<div class="grid xl:grid-cols-2 gap-4 mt-2">
  {#each $status.bt_results as _result, _i}
    {@const i = sortDirection === 'ascending' ? _i : $status.bt_results.length - 1 - _i }
    {@const result = $status.bt_results[i]}

    <div class="card flex flex-wrap grow">
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
    </div>

  {/each}
</div>

