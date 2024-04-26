<script>
	import { getModalStore } from '@skeletonlabs/skeleton'
  import { Chart } from 'svelte-echarts'

	export let parent

	const modalStore = getModalStore()

  const options = {
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'bar',
      },
    ],
  }
</script>

<style global>
</style>

{#if $modalStore[0]}
	<div class="card p-4 shadow-xl max-w-full max-h-[96vh] h-[64rem] w-[64rem]">
    <Chart {options} />
	</div>
{/if}

