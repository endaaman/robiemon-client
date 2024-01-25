<script>
  import format from 'date-fns/format'
  import chroma from 'chroma-js'
  import { getContext  } from 'svelte'
  import { API_BASE } from '$lib/config'
  import { SlideToggle, RangeSlider, RadioGroup, RadioItem, getModalStore, getToastStore } from '@skeletonlabs/skeleton'
  import { Pie } from 'svelte-chartjs'
  import {
      Chart as ChartJS,
      Title,
      Tooltip,
      Legend,
      ArcElement,
      CategoryScale,
    } from 'chart.js'
  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

  const status = getContext('status')
  const modalStore = getModalStore()
  const toastStore = getToastStore()

  const bgColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#AC64AD',
  ]
  const hoverColors = bgColors.map((c) => chroma(c).darken().hex())

  function resultToChartData(result) {
    const keys = ['L', 'M', 'G', 'B']
    return {
      labels: keys.map((k) => `${k} ${parseInt(result[k]*100)}%`),
      datasets: [
        {
          data: [result.L, result.M, result.G, result.B],
          backgroundColor: bgColors,
          hoverBackgroundColor: hoverColors,
        },
      ],
    }
  }

  function timestampToTitle(timestamp) {
    return format(new Date(timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')
  }

  let options = {}
  function updateOptions(results) {
    results.map((r) => {
      if (options[r.timestamp]) {
        return
      }
      options[r.timestamp] = {
          opacity: 0,
          threshold: 10,
      }
    })
    return options
  }

  $: options = updateOptions($status.bt_results)

  let sortDirection = 'descending'

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

<div class="mx-auto grid">
  {#each $status.bt_results as _result, _i}
    {@const i = sortDirection === 'ascending' ? _i : $status.bt_results.length - 1 - _i }
    {@const result = $status.bt_results[i]}

    <div class="xl:w-1/2 lg:w-1/1 md:w-1/1 sm:w-1/1 py-2">
      <div class="card flex flex-wrap">

        <section class="p-4 w-1/1 sm:w-2/3 align-middle">
          <img src={`${API_BASE}/uploads/${result.original_image}`} alt={result.timestamp} width="100%"/>
        </section>

        <section class="w-1/1 sm:w-1/3 w-full flex flex-col">
          <div class="flex flex-wrap">
            <div class="p-4 w-1/2 sm:w-full">
              <h3 class="mb-1">{ timestampToTitle(result.timestamp) }</h3>

              <hr />

              <Pie
                data={ resultToChartData(result) }
                options={{
                  animation: false,
                  plugins: {
                    legend: {
                      position: "right",
                      align: "middle"
                    },
                  },
                  responsive: true
                }}
              />

            </div>

            {#if options[result.timestamp]}
            <div class="p-4 w-1/2 sm:w-full sm:-mt-10">
              <h3 class="my-1 mt-2">Heatmap</h3>
              <hr>
              <div class="mt-2 flex flex-row">
                <div class="w-1/4 min-w-24">
                  Opacity
                </div>
                <div class="w-3/4">
                  <RangeSlider
                    name="range-slider"
                    bind:value={options[result.timestamp].opacity}
                    max={100} step={1}
                  ></RangeSlider>
                </div>
              </div>

              <div class="flex flex-row mt-2">
                <div class="w-1/4 min-w-24">
                  Threashold
                </div>
                <div class="w-3/4">
                  <RangeSlider
                    name="range-slider"
                    bind:value={options[result.timestamp].threshold}
                    max={100} step={1}
                  ></RangeSlider>
                </div>
              </div>


              <h3 class="my-2">Options</h3>
              <hr>
              <hr>
              <div class="mt-2 flex flex-row gap-2">
                <a class="btn btn-sm variant-filled" href="/results/bt/{result.timestamp}">Show detail</a>
                <button class="btn btn-sm variant-filled-error" on:click={ handleDeleteClicked(result) }>Delete</button>
              </div>
            </div>
            {/if}

          </div>


        </section>
      </div>
    </div>
  {/each}
</div>

