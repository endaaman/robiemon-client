<script>
  import { ConicGradient } from '@skeletonlabs/skeleton'
  import { COLORS_BY_DIAGS } from '$lib/const'

  let clazz = ''
  export {clazz as class};
  export let result

  const labels = ['L', 'M', 'G', 'B']

  function resultToConic(result) {
    let last = 0
    return labels.map((k) => {
      const v = {
        label: k,
        color: COLORS_BY_DIAGS[k],
        start: last,
        end: last + result[k] * 100,
      }
      last = last + result[k] * 100
      return v
    })
  }
</script>

<ConicGradient stops={ resultToConic(result) } class="{clazz}"></ConicGradient>
