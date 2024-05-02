<!-- PORTED FROM: https://github.com/bherbruck/svelte-echarts rev:5ce2884d6671665eb96e5c7017dd0d548f67fa22-->
<script>
  import * as echarts from 'echarts'

  const DEFAULT_OPTIONS = {
    theme: undefined,
    renderer: 'canvas',
  }

  export let options
  export let { theme, renderer } = DEFAULT_OPTIONS

  export function chartable(element, echartOptions) {
    const { theme, renderer, options } = {
      ...DEFAULT_OPTIONS,
      ...echartOptions,
    }
    const echartsInstance = echarts.init(element, theme, { renderer })
    echartsInstance.setOption(options)

    function handleResize() {
      echartsInstance.resize()
    }

    window.addEventListener('resize', handleResize)

    return {
      destroy() {
        echartsInstance.dispose()
        window.removeEventListener('resize', handleResize)
      },
      update(newOptions) {
        echartsInstance.setOption({
          ...echartOptions.options,
          ...newOptions.options,
        }, false)
      },
    }
  }
</script>

<div class="chart" use:chartable={{ renderer, theme, options }} />

<style>
  .chart {
    height: 100%;
    width: 100%;
  }
</style>
