<script>
  import { fade } from 'svelte/transition'
  import { getModalStore } from '@skeletonlabs/skeleton'
  import { Chart } from 'svelte-echarts'
  import { API_BASE, STATIC_BASE } from '$lib/config'
  import { COLORS_BY_DIAGS } from '$lib/const'
  import chroma from 'chroma-js'
  import { cache } from './umap_store.js'


  export let parent

  const modalStore = getModalStore()
  const result = $modalStore[0].result

  async function fetchData() {
    if (!$cache[result.model]) {
      const res = await fetch(`${API_BASE}/bt/umap/embeddings/${result.model}`)
      $cache[result.model] = await res.json()
    } else {
      console.log('restore cache')
    }
    const embeddings = $cache[result.model]

    // const DIAG2NAME = {
    //   L: 'Lymphoma',
    //   M: 'Brain metastasis',
    //   G: 'Glioblastoma',
    //   A: 'Astrocytoma',
    //   O: 'Oligodendroglioma',
    //   B: 'Brain tissue',
    // }

    const seriesMap = {}
    'LMGAOB'.split('').forEach((v, i)=> {
      seriesMap[v] = {
        name: v,
        type: 'scatter',
        data: [],
        itemStyle: {
          color: COLORS_BY_DIAGS[v],
        },
      }
    })
    embeddings.forEach((v, i) => {
      // Example: {
      //     "correct": false,
      //     "diag": "G",
      //     "diag_org": "O",
      //     "filename": "0000.jpg",
      //     "name": "N23-156",
      //     "pred": "B",
      //     "x": 2.619306564331055,
      //     "y": 3.976931571960449
      // }
      seriesMap[v.diag_org].data.push({
        value: [v.x, v.y],
        imageUri: `${STATIC_BASE}/umap_tiles/${v.diag_org}_${v.name}_${v.filename}`,
        text: `GT:${v.diag_org} pred:${v.pred}`,
        symbol: v.correct ? 'circle' : 'triangle',
        symbolSize: v.correct ? 5 : 10,
      })
    })

    const res = await fetch(`${API_BASE}/bt/umap/${result.timestamp}`, { method: 'POST', })
    const pos = await res.json()

    const keys = 'LMGB'.split('')
    let pred = keys[0]
    keys.forEach(key => {
      if (result[key] > result[pred]) {
        pred = key
      }
    })
    const text = keys.map((k) => `${k}:${Math.round(result[k]*100)}%`).join(' ')

    const series = Object.values(seriesMap)
    series.push({
      name: pred,
      type: 'scatter',
      data: [
        {
          value: [pos.x, pos.y],
          imageUri: `${STATIC_BASE}/results/bt/${result.timestamp}/thumb.png`,
          text: text,
          itemStyle: {
            color: chroma(COLORS_BY_DIAGS[pred]).darken(2).css(),
          },
          symbol: 'pin',
          symbolSize: 36,
        }
      ],
      z: 100,
    })

    return {
      xAxis: {},
      yAxis: {},
      legend: {
        data: ['L', 'M', 'G', 'A', 'O', 'B'],
      },
      tooltip: {
        // position: 'top',
        transitionDuration: 0.0,
        formatter: function (p) {
          return `<p>${p.data.text}</p><img src="${p.data.imageUri}" style="width: 25vw; height: auto;" />`
        }
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'filter'
        }, {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'filter'
        }, {
          type: 'inside',
          // xAxisIndex: [0],
          // yAxisIndex: [0],
          // start: 0,
          // end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true
        }
      ],
      series: series,
    }
  }
</script>

<style global>
</style>

{#if $modalStore[0]}
  <div class="card shadow-xl max-w-full max-h-[96vh] h-[64rem] w-[64rem] overflow-hidden">
    {#await fetchData()}
      <div class="p-4 flex h-full justify-center items-center" transition:fade={{ delay: 250, duration: 300 }}>
        <span class="i-mdi-loading animate-spin text-[180px] text-secondary-300"></span>
      </div>
    {:then options}
      <Chart {options} />
    {/await}
  </div>
{/if}

