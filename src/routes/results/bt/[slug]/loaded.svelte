<script>
	import { page } from '$app/stores'
  import format from 'date-fns/format'
	import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider, ConicGradient,
  } from '@skeletonlabs/skeleton'
  import { STATIC_BASE } from '$lib/config'

  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

	export let result;

  const imagePath = `${STATIC_BASE}/uploads/${result.original_image}`
  const camPath = result.cam_image ? `${STATIC_BASE}/cams/${result.cam_image}` : ""

  let opacity = 0
  let imageWidth = 0
  let imageHeight = 0
  function handleImageLoaded(e) {
    imageWidth = e.target.clientWidth
    imageHeight = e.target.clientHeight
  }

</script>

<style>
</style>

<!-- <pre>{ JSON.stringify(data, 0, 2) }</pre> -->
<!-- <pre>{ JSON.stringify($page, 0, 2) }</pre> -->

<div class="grid grid-cols-3 auto-rows-min gap-4 pt-4">

  <div class="col-span-2">

    <div class="relative">
      <img src={imagePath} alt="original_{result.timestamp}" on:load={ handleImageLoaded }>
      {#if camPath}
        <div
          class="absolute left-0 top-0 mix-blend-multiply"
          style="background-image: url({camPath}); opacity: {opacity/100}; width: {imageWidth}px; height: {imageHeight}px;"
        ></div>
      {/if}
    </div>

  </div>

  <div>

    <h3>Prediction</h3>
    <hr class="my-2" />

    <div class="my-auto py-4 flex flex-row">
      <div class="w-1/2 md:w-2/3">
        <BtResultCircle result={ result }></BtResultCircle>
      </div>
      <div class="w-1/2 md:w-1/3">
        <BtResultPredictions result={ result }></BtResultPredictions>
      </div>
    </div>

    <h3>UMAP Presentasion</h3>
    <hr class="my-2" />

    <div class="w-full">
      <button class="btn btn-sm variant-filled w-full" disabled>Show UMAP</button>
    </div>

    <h3 class="mt-6">CAM</h3>
    <hr class="my-2" />

    <div class="flex flex-row">
      <div class="w-24 font-semibold">Opacity</div>
      <div class="w-full">
        <RangeSlider
          name="range-slider"
          min={0} max={100} step={1} bind:value={ opacity }
          disabled={ !result.cam_image }
        ></RangeSlider>
      </div>
    </div>


    <h3 class="mt-6">Data</h3>
    <hr class="my-2" />

    <div class="flex flex-row my-2">
      <div class="w-24 font-semibold">Name</div>
      <div class="w-full"> { result.name } </div>
    </div>

    <div class="flex flex-row my-2">
      <div class="w-24 font-semibold">Date</div>
      <div class="w-full">{ format(new Date(result.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss') }</div>
    </div>

  </div>

</div>
