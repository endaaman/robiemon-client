<script>
  import format from 'date-fns/format'
  import chroma from 'chroma-js'
  import { getContext  } from 'svelte'
  import { API_BASE } from '$lib/config'
  import { SlideToggle, RangeSlider } from '@skeletonlabs/skeleton'

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

  const bgColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#AC64AD',
  ]
  const hoverColors = bgColors.map((c) => chroma(c).darken().hex())
  console.log(hoverColors)

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

  let opacityHeatmap = 0
  let thresholdHeatmap = 10

</script>

<div class="mx-auto grid">
  {#each $status.bt_results as result, i}
    <div class="xl:w-1/2 lg:w-1/1 md:w-1/1 sm:w-1/1 py-2">
      <div href="/results/bt/{result.timestamp}" class="card flex flex-wrap">

        <section class="p-4 w-1/1 sm:w-2/3 align-middle">
          <img src={`${API_BASE}/uploads/${result.original_image}`} alt={result.timestamp} />
        </section>

        <section class="w-1/1 sm:w-1/3 w-full flex flex-col">
          <div class="flex flex-wrap">
            <div class="p-4 w-1/2 sm:w-full">
              <h3 class="mb-1">{ timestampToTitle(result.timestamp) }</h3>

              <hr />

              <Pie
                class="-mt-4"
                data={ resultToChartData(result) }
                options={{
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

            <div class="p-4 w-1/2 sm:w-full">
              <h3 class="mb-1">Heatmap options</h3>
              <hr>
              <div class="mt-2 flex flex-row">
                <div class="w-1/4 min-w-24">
                  Opacity
                </div>
                <div class="w-3/4">
                  <RangeSlider
                    name="range-slider"
                    bind:value={opacityHeatmap}
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
                    bind:value={thresholdHeatmap}
                    max={100} step={1}
                  ></RangeSlider>
                </div>
              </div>
            </div>

          </div>


        </section>
      </div>
    </div>
  {/each}
</div>

