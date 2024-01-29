<script>
  import {
    ConicGradient,
  } from '@skeletonlabs/skeleton'

  export let result

  const labels = ['L', 'M', 'G', 'B']

  const labelColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#AC64AD',
  ]

  function resultToConic(result) {
    let last = 0
    return labels.map((k, i) => {
      const v = {
        label: k,
        color: labelColors[i],
        start: last,
        end: last + result[k] * 100,
      }
      last = last + result[k] * 100
      return v
    })
  }
</script>

<ConicGradient stops={ resultToConic(result) }></ConicGradient>
