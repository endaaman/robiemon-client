<script>
	import { COLORS_BY_DIAGS } from '$lib/const'
  const labels = ['L', 'M', 'G', 'B']
  export let result
</script>
<ul>
  {#each labels as label, j}
    <li class="flex items-center align-middle p-1">
      <div
        class="w-4 h-4 min-w-4 min-h-4 rounded-full mr-2"
        style="background-color: {COLORS_BY_DIAGS[label]};"></div>
      <span class="w-4 min-w-4">{label}</span>
      <span>{ Math.round(result[label] * 100) }%</span>
    </li>
  {/each}
</ul>
