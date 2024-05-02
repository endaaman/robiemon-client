<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import { getModalStore } from '@skeletonlabs/skeleton'
  import { browser } from '$app/environment'
  import chroma from 'chroma-js'

  import { API_BASE, STATIC_BASE } from '$lib/config'
  import { COLORS_BY_DIAGS } from '$lib/const'
  import { cache } from './umap_store.js'

  import * as echarts from 'echarts'

  const DIAG2NAME = {
    L: 'Lymphoma',
    M: 'Brain metastasis',
    G: 'Glioblastoma',
    A: 'Astrocytoma',
    O: 'Oligodendroglioma',
    B: 'Brain tissue',
  }

  export let parent

  const codes = 'BLMGAO'.split('')

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
  let echartsInstance = null
  let echartsElement = null
  let options = null

  let mode = modes[0].value
  let symbolSize = 5
  let showIncorrect = true

  let embeddings = null
  let position = null

  function generateStardardOptions() {
    console.log('reload standard options')
    const seriesMap = {}
    codes.forEach((v)=> {
      [0, 1].forEach((c)=> {
        seriesMap[`${v}_${c}`] = {
          name: v,
          type: 'scatter',
          data: [],
          itemStyle: {
            color: COLORS_BY_DIAGS[v],
          },
          animationDelay: function(idx) {
            return -idx
          }
        }
      })
    })
    embeddings.forEach((v) => {
      // if (v.diag_org === 'B') {
      //   return
      // }
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
      if (!showIncorrect && !v.correct) {
        return
      }
      const seriesKey = `${v.diag_org}_${v.correct ? 1 : 0}`
      let text = `${v.name} ${v.diag_org}`
      if (!v.correct) {
        text += `(pred:${v.pred})`
      }
      if (v.diag_org === 'M') {
        text += ` origin:${v.origin}`
      }
      seriesMap[seriesKey].data.push({
        value: [v.x, v.y],
        imageUri: `${STATIC_BASE}/umap_tiles/${v.diag_org}_${v.name}_${v.filename}`,
        text,
        symbol: v.correct ? 'circle' : 'triangle',
        symbolSize: v.correct ? symbolSize : symbolSize+5,
      })
    })

    const series = Object.values(seriesMap)
    const resultName = result.name || 'Result'
    series.push({
      name: resultName,
      type: 'scatter',
      itemStyle: {
        color: COLORS_BY_DIAGS[pred],
      },
      data: [
        {
          value: [position.x, position.y],
          imageUri: `${STATIC_BASE}/results/bt/${result.timestamp}/thumb.png`,
          text: `${resultName}<br>${predText}`,
          symbol: 'pin',
          symbolSize: 36,
          itemStyle: {
            borderWidth: 1.5,
            borderType: 'solid',
            borderColor: chroma(COLORS_BY_DIAGS[pred]).saturate(2).darken(2).css(),
          }
        }
      ],
      z: 100,
    })
    return {
      xAxis: {},
      yAxis: {},
      legend: {
        data: [resultName, ...codes],
        orient: 'vertical',
        top: 'middle',
        left: 'left'
      },
      tooltip, dataZoom, series,
    }
  }

  function generateMetaOptions() {
    console.log('reload origin options')
    const seriesMap = {}
    const origins = {}
    embeddings.forEach((v) => {
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
      const seriesKey = `${v.origin}_${v.correct ? 1 : 0}`
      if (!seriesMap[seriesKey]) {
        if (!showIncorrect && !v.correct) {
          return
        }
        seriesMap[seriesKey] = {
          name: v.origin,
          type: 'scatter',
          data: [],
        }
        origins[v.origin] = 0
      }
      seriesMap[seriesKey].data.push({
        value: [v.x, v.y],
        imageUri: `${STATIC_BASE}/umap_tiles/${v.diag_org}_${v.name}_${v.filename}`,
        text: `${v.name} ${v.diag_org}<br>pred:${v.pred} origin:${v.origin}`,
        symbol: v.correct ? 'circle' : 'triangle',
        symbolSize: v.correct ? symbolSize : symbolSize+5,
      })
      origins[v.origin] += 1
    })

    const series = Object.values(seriesMap)
    const resultName = result.name || 'Result'
    series.push({
      name: resultName,
      type: 'scatter',
      data: [
        {
          value: [position.x, position.y],
          imageUri: `${STATIC_BASE}/results/bt/${result.timestamp}/thumb.png`,
          text: `${resultName}<br>${predText}`,
          symbol: 'pin',
          symbolSize: 36,
          itemStyle: {
            borderWidth: 1,
            borderType: 'solid',
            borderColor: '#000',
          },
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

  async function updateOptions() {
    await tick()
    options = ({
      standard: generateStardardOptions,
      meta: generateMetaOptions,
    }[mode])()
    echartsInstance.setOption(options, true)
  }

  function handleSymbolSizeChanged(e) {
    symbolSize = Number(e.target.value)
    updateOptions()
  }

  function handleResized() {
    echartsInstance.resize()
  }

  onMount(async function() {
    if (!browser) {
      return
    }
    echartsInstance = echarts.init(echartsElement)

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
    loadingMessage = `Done.`
    updateOptions()

    window.addEventListener('resize', handleResized)
  })

  onDestroy(async function() {
    if (!browser) {
      return
    }
    window.removeEventListener('resize', handleResized)
  })
</script>

<style global>
</style>

{#if $modalStore[0]}
  <div class="card relative shadow-xl max-w-full max-h-[96vh] h-[64rem] w-[64rem] overflow-hidden bg-white">
    <header class="absolute p-2 z-10 flex gap-2 bg-surface-50 w-full text-sm">
      <div class="flex space-x-1 items-center">
        <label for="mode">Mode</label>
        <select id="mode" class="select text-xs p-1 w-[120px]" bind:value={mode} on:change={ updateOptions }>
          {#each modes as m}
            <option value={m.value}>{m.label}</option>
          {/each}
        </select>
      </div>

      <div class="flex space-x-1 items-center">
        <label for="symbol-size" class="w-14">Size:{symbolSize}</label>
        <input id="symbol-size" type="range" max="15" step="0.5"
          value={symbolSize} on:change={ handleSymbolSizeChanged }/>
      </div>

      <label class="flex items-center space-x-1">
        <input class="checkbox" type="checkbox" bind:checked={showIncorrect} on:change={ updateOptions }/>
        <p>Show incorrect {showIncorrect}</p>
      </label>
    </header>

    {#if !options}
    <div class="p-4 flex flex-col h-full justify-center items-center" transition:fade={{ duration: 300 }}>
      <span class="i-mdi-loading animate-spin text-[180px] text-secondary-300"></span>
      <p class="mt-8 text-center text-surface-400">{ loadingMessage }</p>
    </div>
    {/if}
    <div bind:this={ echartsElement } style="height: 100%; width: 100%;"></div>
  </div>
{/if}

