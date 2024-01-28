<script>
	import { page } from '$app/stores'
	import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider,
  } from '@skeletonlabs/skeleton'
	import { API_BASE } from '$lib/config'

	// export let data;

	const status = getContext('status')
  let context

  let result = null
  let threshold = 50

  const image = new Image()
  let camImageElement
  let canvasElement


	$: result = $status.bt_results.find((r) => {
		return r.timestamp === parseInt($page.params.slug)
  })
  $: {
    if (result) {
      image.src = `/cams/${result.cam_image}`
      image.onload = function () {
        // canvasElement.width = image.width;
        // canvasElement.height = image.height;
        updateCanvas();
      }
    }
  }

  function handleSliderChanged(e) {
      threshold = e.target.value / 100
      updateCanvas()
  }

  function updateCanvas() {
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(image, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        var value = (brightness >= threshold) ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
  }
</script>

<a href="/results/bt" class="btn variant-ghost-surface">
	<span class="i-mdi-format-list-bulleted-square"></span>
	<span>Back to list</span>
</a>

<!-- <pre>{ JSON.stringify(data, 0, 2) }</pre> -->
<!-- <pre>{ JSON.stringify($page, 0, 2) }</pre> -->

{#if result}
<div class="mt-4 grid grid-cols-3 auto-rows-min gap-4">
	<div class="col-span-2">
		<!-- {#if result.cam_image} -->
      <!-- <!-1- <img src="/cams/{result.cam_image}" alt="cam_{result.timestamp}" bind:this={camImageElement}> -1-> -->
      <!-- <canvas bind:this={canvasElement} class="w-full"></canvas> -->
		<!-- {/if} -->
		<img src="{API_BASE}/uploads/{result.original_image}" alt="original_{result.timestamp}">
	</div>
	<div>
    <RangeSlider name="range-slider" on:change={ handleSliderChanged } value={50}
        min={0} max={100} step={1}>Threshold</RangeSlider>

		<pre>{ JSON.stringify(result, 0, 2) }</pre>
	</div>

</div>

{:else}
	<p>Not found</p>
{/if}
