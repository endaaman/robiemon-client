<script>
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
    console.log($cache)
    if (!$cache[result.model]) {
      const res = await fetch(`${API_BASE}/bt/umap/embeddings/${result.model}`)
      $cache[result.model] = await res.json()
    } else {
      console.log('restore cache')
    }
    const embeddings = $cache[result.model]

    const points = embeddings.map((v, i) => {
      // {
      //     "correct": false,
      //     "diag": "G",
      //     "diag_org": "O",
      //     "filename": "0000.jpg",
      //     "name": "N23-156",
      //     "pred": "B",
      //     "x": 2.619306564331055,
      //     "y": 3.976931571960449
      // }
      // {value: [13.0, 7.58], symbol: 'circle', symbolSize: 20, itemStyle: {color: '#ffd700'}},
      return {
        value: [v.x, v.y],
        symbol: v.correct ? 'circle' : 'triangle',
        symbolSize: v.correct ? 4 : 7,
        itemStyle: {
          color: COLORS_BY_DIAGS[v.diag_org]
        },
        imageUri: `${STATIC_BASE}/umap_tiles/${v.diag_org}_${v.name}_${v.filename}`,
        text: `GT:${v.diag_org} pred:${v.pred}`,
      }
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

    points.push({
      value: [pos.x, pos.y],
      symbol: 'pin',
      symbolSize: 30,
      itemStyle: {
        color: chroma(COLORS_BY_DIAGS[pred]).darken(2).css(),
        // color: '#000',
      },
      imageUri: `${STATIC_BASE}/results/bt/${result.timestamp}/thumb.png`,
      text: text,
    })

    return {
      options: {
        tooltip: {
          formatter: function (p) {
            return `<p>${p.data.text}</p><img src="${p.data.imageUri}" style="width: 25vw; height: auto;" />`
          }
        },
        xAxis: {},
        yAxis: {},
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
        series: [{
          symbolSize: 5,
          data: points,
          type: 'scatter',
        }],
      }
    }
  }
</script>

<style global>
</style>

{#if $modalStore[0]}
	<div class="card p-4 shadow-xl max-w-full max-h-[96vh] h-[64rem] w-[64rem]">
    {#await fetchData()}
      <p>ロード中</p>
    {:then data}
      <Chart options={ data.options } />
    {/await}
	</div>
{/if}

