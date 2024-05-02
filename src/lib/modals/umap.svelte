<script>
  import { fade } from 'svelte/transition'
  import { getModalStore } from '@skeletonlabs/skeleton'
  import { onMount } from 'svelte'
  import Chart from '$lib/chart.svelte'
  import { API_BASE, STATIC_BASE } from '$lib/config'
  import { COLORS_BY_DIAGS } from '$lib/const'
  import chroma from 'chroma-js'
  import { cache } from './umap_store.js'

  const DIAG2NAME = {
    L: 'Lymphoma',
    M: 'Brain metastasis',
    G: 'Glioblastoma',
    A: 'Astrocytoma',
    O: 'Oligodendroglioma',
    B: 'Brain tissue',
  }

  export let parent

  const modalStore = getModalStore()
  const result = $modalStore[0].result

  const keys = 'LMGB'.split('')
  let pred = keys[0]
  keys.forEach(key => {
    if (result[key] > result[pred]) {
      pred = key
    }
  })
  const predText = keys.map((k) => `${k}:${Math.round(result[k]*100)}%`).join(' ')

  const modes = [
    { value: 'standard', label: 'LMGAOB',  },
    { value: 'meta', label: 'Meta origin', },
  ]

  const tooltip = {
    transitionDuration: 0.0,
    formatter: function (p) {
      return `<p>${p.data.text}</p><img src="${p.data.imageUri}" style="width: 25vw; height: auto;" />`
    }
  }
  const dataZoom = [
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
  ]


  let loadingMessage = 'Preparing'
  let options = null

  let embeddings = null
  let position = null

  function generateStardardOptions() {
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
      let text = `${v.name} ${v.diag_org}`
      if (!v.correct) {
        text += `(pred:${v.pred})`
      }
      if (v.diag_org === 'M') {
        text += ` origin:${v.origin}`
      }
      seriesMap[v.diag_org].data.push({
        value: [v.x, v.y],
        imageUri: `${STATIC_BASE}/umap_tiles/${v.diag_org}_${v.name}_${v.filename}`,
        text,
        symbol: v.correct ? 'circle' : 'triangle',
        symbolSize: v.correct ? 5 : 10,
      })
    })

    const series = Object.values(seriesMap)
    series.push({
      name: pred,
      type: 'scatter',
      data: [
        {
          value: [position.x, position.y],
          imageUri: `${STATIC_BASE}/results/bt/${result.timestamp}/thumb.png`,
          text: predText,
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
        orient: 'vertical',
        top: 'middle',
        left: 'left'
      },
      tooltip, dataZoom, series,
    }
  }

  function generateMetaOptions() {
    const seriesMap = {}
    const origins = {}
    embeddings.forEach((v, i) => {
      // Example: {
      //   "name": "19-0991",
      //   "filename": "0493.jpg",
      //   "diag": "M",
      //   "diag_org": "M",
      //   "pred": "M",
      //   "x": 14.68503379821777,
      //   "y": 5.436352729797363,
      //   "correct": true,
      //   "origin": "breast"
      // }
      if (!v.origin) {
        return
      }
      if (!seriesMap[v.origin]) {
        seriesMap[v.origin] = {
          name: v.origin,
          type: 'scatter',
          data: [],
        }
        origins[v.origin] = 0
      }
      seriesMap[v.origin].data.push({
        value: [v.x, v.y],
        imageUri: `${STATIC_BASE}/umap_tiles/${v.diag_org}_${v.name}_${v.filename}`,
        text: `${v.name} ${v.diag_org}<br>pred:${v.pred} origin:${v.origin}`,
        symbol: v.correct ? 'circle' : 'triangle',
        symbolSize: v.correct ? 5 : 10,
      })
      origins[v.origin] += 1
    })

    console.log(origins)

    const series = Object.values(seriesMap)
    const resultName = result.name || 'Result'
    series.push({
      name: resultName,
      type: 'scatter',
      data: [
        {
          value: [position.x, position.y],
          imageUri: `${STATIC_BASE}/results/bt/${result.timestamp}/thumb.png`,
          text: predText,
          symbol: 'pin',
          symbolSize: 36,
        }
      ],
      z: 100,
    })
    const legends = Object.entries(origins)
    legends.sort((a, b) => {
      if (b[0] === 'Unknown') {
        return -1
      }
      if (a[0] === 'Unknown') {
        return 1
      }
      return b[1] - a[1]
    })
    return {
      xAxis: {},
      yAxis: {},
      legend: {
        data: [resultName, ...legends.map((v)=> v[0])],
        orient: 'vertical',
        top: 'middle',
        left: 'left'
      },
      tooltip, dataZoom, series,
    }
  }

  function handleModeChanged(e) {
    options = ({
      standard: generateStardardOptions,
      meta: generateMetaOptions,
    }[e.target.value])()
    console.log('up', options)
  }

  onMount(async function() {
    loadingMessage = 'Loading the background embeddings..'
    if (!$cache[result.model]) {
      const res = await fetch(`${API_BASE}/bt/umap/embeddings/${result.model}`)
      $cache[result.model] = await res.json()
    } else {
      console.log('restore cache')
    }
    embeddings = $cache[result.model]

    loadingMessage = `Calculating the embeddings of ${result.name}...`
    const res = await fetch(`${API_BASE}/bt/umap/${result.timestamp}`, { method: 'POST', })
    position = await res.json()

    loadingMessage = `Preparing UMAP...`

    options = generateStardardOptions()
  })

</script>

<style global>
</style>

{#if $modalStore[0]}
  <div class="card relative shadow-xl max-w-full max-h-[96vh] h-[64rem] w-[64rem] overflow-hidden bg-white">
    <header class="absolute p-1 z-10">
      <select class="select text-xs p-1 w-[120px]" on:change={ handleModeChanged }>
        {#each modes as m}
          <option value={m.value}>{m.label}</option>
        {/each}
      </select>
    </header>
    {#if !options}
      <div class="p-4 flex flex-col h-full justify-center items-center" transition:fade={{ duration: 300 }}>
        <span class="i-mdi-loading animate-spin text-[180px] text-secondary-300"></span>
        <p class="mt-8 text-center text-surface-400">{ loadingMessage }</p>
      </div>
    {:else}
      <Chart {options} />
    {/if}
  </div>
{/if}

