<script>
  import format from 'date-fns/format'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation';
	import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider, ConicGradient, getToastStore, getModalStore,
  } from '@skeletonlabs/skeleton'
  import { API_BASE, STATIC_BASE } from '$lib/config'
	import { debounce } from '$lib'

  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

	export let result;

	const status = getContext('status')

  const toastStore = getToastStore()
  const modalStore = getModalStore()

  let imagePath = null
  let camPath = null
  $: {
    imagePath = `${STATIC_BASE}/results/bt/${result.timestamp}/original.jpg`
    camPath = result.with_cam ? `${STATIC_BASE}/results/bt/${result.timestamp}/cam.png` : ""
  }

  let naturalWidth = 0
  let naturalHeight = 0

  let imageElement
  let opacity = 0
  let imageWidth = 0
  let imageHeight = 0
  let editingName = false
  let editingMemo = false
  let newName = result.name
  let newMemo = result.memo

  let modelName = result.moden
  $: {
    const m = $status.bt_models.find((m)=> m.name === result.model)
    modelName = m ? m.label : result.model
  }

  function handleImageLoaded() {
    if (imageElement) {
      imageWidth = imageElement.clientWidth
      imageHeight = imageElement.clientHeight
    }
  }

  async function patchResult(body) {
    try {
      await fetch(`${API_BASE}/bt/results/${result.timestamp}`, {
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

  function onModalResponded(result) {
    if (result === 'error') {
      toastStore.trigger({
        message: 'Error: Something went wrong.',
        timeout: 5000,
        background: 'variant-filled-error',
      })
    }

    if (result) {
      toastStore.trigger({
        message: `The task was accepted as "${result.name}"`,
        // timeout: 7000,
        autohide: false,
        background: 'variant-filled-primary',
        action: {
          label: 'See tasks',
          response: () => {
            goto('/results')
          }
        }
      })
      return
    }
  }

  function handleRepredictClicked(e) {
    modalStore.trigger({
      type: 'component',
      component: 'predict',
      imageURI: imagePath,
      response: onModalResponded,
    })
  }

  function handleUMAPClicked() {
    modalStore.trigger({
      type: 'component',
      component: 'umap',
    })
  }

  async function handleDeleteClicked() {
    modalStore.trigger({
      type: 'confirm',
      title: 'Delete confirm',
      body: 'Are you sure to delete?',
      response: async (r) => {
        if (!r) {
          return
        }
        try {
          await fetch(`${API_BASE}/bt/results/${result.timestamp}`, {
            method: 'DELETE',
          })
          toastStore.trigger({
            message: `Result deleted.`,
            timeout: 5000,
            background: 'variant-filled',
          })
          goto('/results/bt')
        } catch (error) {
          console.log(error)
          toastStore.trigger({
            message: 'Error: Failed to connect server.',
            timeout: 5000,
            background: 'variant-filled-error',
          })
        } finally {
        }
      },
    })
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


<div class="grid grid-cols-3 gap-4 mt-4">
  <div class="col-span-2">
    <div class="relative w-full">
      <img
        src={imagePath}
        alt="original_{result.timestamp}"
        on:load={ handleImageLoaded }
        bind:this={ imageElement }
        bind:naturalWidth={ naturalWidth }
        bind:naturalHeight={ naturalHeight }
      >
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

    <section>
      <h3>UMAP Presentasion</h3>
      <hr class="my-2" />

      <div class="flex flex-row w-full gap-2">
        <button class="btn btn-sm variant-filled block" on:click={ handleRepredictClicked }>
          Re-predict
        </button>
        <button class="btn btn-sm variant-filled block" on:click={ handleUMAPClicked }>
          Show UMAP
        </button>
        <button class="btn btn-sm variant-filled-error block" on:click={ handleDeleteClicked }>
          Delete
        </button>
      </div>
    </section>

    <section>
      <h3>CAM</h3>
      <hr class="my-2" />

      <div class="flex flex-row">
        <div class="w-24 font-semibold">Opacity</div>
        <div class="w-full">
          <RangeSlider
            name="range-slider"
            min={0} max={100} step={1} bind:value={ opacity }
            disabled={ !result.with_cam }
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
        <div>{ naturalWidth } × { naturalHeight }px </div>
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
