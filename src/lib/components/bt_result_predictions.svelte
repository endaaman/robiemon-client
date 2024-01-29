<script>
  const labels = ['L', 'M', 'G', 'B']

  const labelColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#AC64AD',
  ]

  export let result
</script>
<ul>
  {#each labels as label, j}
    <li class="flex items-center align-middle p-1">
      <div class="w-4 h-4 min-w-4 min-h-4 rounded-full mr-2" style="background-color: {labelColors[j]};"></div>
      <span class="w-4 min-w-4">{label}</span>
      <span>{ Math.round(result[label] * 100) }%</span>
    </li>
  {/each}
</ul>
