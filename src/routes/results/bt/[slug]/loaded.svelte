<script>
  import { browser } from '$app/environment'
  import format from 'date-fns/format'
	import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider, ConicGradient, getToastStore,
  } from '@skeletonlabs/skeleton'
  import { API_BASE, STATIC_BASE } from '$lib/config'
	import { debounce } from '$lib'

  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

	export let result;


	const status = getContext('status')

  const imagePath = `${STATIC_BASE}/uploads/${result.original_image}`
  const camPath = result.cam_image ? `${STATIC_BASE}/cams/${result.cam_image}` : ""

  const toastStore = getToastStore()

  let imageElement
  let opacity = 0
  let imageWidth = 0
  let imageHeight = 0
  let editingName = false
  let editingMemo = false
  let newName = result.name
  let newMemo = result.memo

  let modelName = result.weight
  $: {
    const m = $status.bt_weights.find((m)=> m.weight === result.weight)
    modelName = m ? m.label : result.weight
  }

  function handleImageLoaded() {
    if (imageElement) {
      imageWidth = imageElement.clientWidth
      imageHeight = imageElement.clientHeight
    }
  }

  async function patchResult(body) {
    try {
      await fetch(`${API_BASE}/results/bt/${result.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      toastStore.trigger({
        message: `Updated.`,
        timeout: 2000,
        background: 'variant-filled',
      })

    } catch (error) {
      console.log(error)
      toastStore.trigger({
        message: 'Error: Somethin went wrong.',
        timeout: 7000,
        background: 'variant-filled-error',
      })
    } finally {
    }
  }

  function toggleEditingName() {
    // if (!editingName) {
    //   newName = result.name
    // }
    editingName = !editingName
  }

  function handleNameKeydown(e) {
    if (e.code === 'Enter') {
      saveName()
      e.preventDefault()
    }
  }

  async function saveName() {
    console.log('saveName')
    await patchResult({ name: newName })
    editingName = false
  }

  function toggleEditingMemo() {
    // if (!editingMemo) {
    //   newMemo = result.memo
    // }
    editingMemo = !editingMemo
  }

  async function saveMemo() {
    await patchResult({ memo: newMemo })
    editingMemo = false
  }


	onMount(async () => {
		if (browser) {
      window.addEventListener('resize', handleImageLoaded)
		}
  })
</script>

<style>
</style>

<!-- <pre>{ JSON.stringify(data, 0, 2) }</pre> -->
<!-- <pre>{ JSON.stringify($page, 0, 2) }</pre> -->

<div class="grid grid-cols-3 auto-rows-min gap-4 pt-4">
  <div class="col-span-2">
    <div class="relative w-full">
      <img src={imagePath} alt="original_{result.timestamp}" on:load={ handleImageLoaded } bind:this={ imageElement }>
      {#if camPath}
        <div
          class="absolute left-0 top-0 mix-blend-multiply"
          style="background-size: 100% 100%; background-image: url({camPath}); opacity: {opacity/100}; width: {imageWidth}px; height: {imageHeight}px;"
        ></div>
      {/if}
    </div>

  </div>

  <div class="flex flex-col gap-6">

    <section>
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
    </section>

    <!-- <section> -->
    <!--   <h3>UMAP Presentasion</h3> -->
    <!--   <hr class="my-2" /> -->

    <!--   <div class="w-full"> -->
    <!--     <button class="btn btn-sm variant-filled w-full" disabled>Show UMAP</button> -->
    <!--   </div> -->
    <!-- </section> -->

    <section class="-mt-8">
      <h3>CAM</h3>
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
    </section>


    <section>
      <h3>Data</h3>
      <hr class="my-2" />


      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Name</div>
        {#if editingName}
          <div class="grow">
            <input
              type="text"
              class="p-0 block w-full"
              bind:value={ newName }
              on:keydown={ handleNameKeydown }
            >
          </div>
          <button on:click={ saveName } class="block">
            <span class="i-mdi-check text-lg"></span>
          </button>
        {:else}
          <div class="grow">
            <button class="text-left block" on:click={ toggleEditingName }>{ result.name }</button>
          </div>
        {/if}

        <button on:click={ toggleEditingName } class="block">
          <span class="text-lg i-mdi-pencil"
            class:i-mdi-pencil={ !editingName }
            class:i-mdi-close={ editingName }
          ></span>
        </button>
      </div>

      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Size</div>
        <div>{ imageWidth } × { imageHeight }px </div>
      </div>

      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Model</div>
        <div> { modelName } </div>
      </div>

      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Date</div>
        <div>{ format(new Date(result.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss') }</div>
      </div>

      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Memo</div>

        <div class="grow">
          {#if editingMemo}
            <textarea
              class="w-full block p-0"
              rows="3" bind:value={newMemo}
            ></textarea>

            <div class="mt-1 flex flex-row">
              <button class="btn btn-sm variant-soft w-1/2" on:click={ ()=>{ newMemo = '' } }>Clear</button>
              <button class="btn btn-sm variant-soft-primary w-1/2" on:click={ saveMemo }>Save</button>
            </div>
          {:else}
            {#if result.memo}
              <button class="block text-left" on:click={ toggleEditingMemo }>{ result.memo }</button>
            {:else}
              <button class="text-surface-500 grow" on:click={ toggleEditingMemo }>Click to add memo...</button>
            {/if}
          {/if}
        </div>

        <button on:click={ toggleEditingMemo } class="block">
          <span class="block align-text-top h-full">
            <span class="text-lg"
              class:i-mdi-pencil={ !editingMemo }
              class:i-mdi-close={ editingMemo }
            ></span>
          </span>
        </button>
      </div>
    </section>

    <!-- <section class="mt-auto"> -->
    <!--   <hr class="my-2" /> -->

    <!--   <div class="flex flex-row gap-2"> -->
    <!--     <button class="btn btn-sm variant-filled w-full">Re-predict</button> -->
    <!--     <button class="btn btn-sm variant-filled-error">Delete</button> -->
    <!--   </div> -->
    <!-- </section> -->

  </div>

</div>
