<script>
  import format from 'date-fns/format'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation';
  import { navigating } from '$app/stores'
  import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider, ConicGradient, getToastStore, getModalStore,
  } from '@skeletonlabs/skeleton'
  import { API_BASE, STATIC_BASE } from '$lib/config'
  import { debounce } from '$lib'

  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

  export let result;

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const status = getContext('status')

  const toastStore = getToastStore()
  const modalStore = getModalStore()

  let imageElement
  let editNameElement
  let editMemoElement

  let imagePath = null
  let camPath = null
  let newName = result.name
  let newMemo = result.memo
  let modelName = result.moden
  let editingName = false
  let editingMemo = false
  let opacity = 0
  $: {
    imagePath = `${STATIC_BASE}/results/bt/${result.timestamp}/original.jpg`
    camPath = result.with_cam ? `${STATIC_BASE}/results/bt/${result.timestamp}/cam.png` : ""

    const m = $status.bt_models.find((m)=> m.name === result.model)
    modelName = m ? m.label : result.model
  }
  $: if($navigating) {
    newName = result.name
    newMemo = result.memo
    editingName = false
    editingMemo = false
    // あえて更新しない
    // opacity = 0
  }

  let naturalWidth = 0
  let naturalHeight = 0
  let imageWidth = 0
  let imageHeight = 0

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
      if (body.name) {
        editingName = false
      }
      if (body.memo) {
        editingMemo = false
      }
    }
  }

  //////////
  //* Name
  async function saveName() {
    if (!newName) {
      toastStore.trigger({
        message: 'Warning: Name should not be empty.',
        timeout: 5000,
        background: 'variant-filled-warning',
      })
      newName = result.name
      return
    }
    await patchResult({ name: newName })
  }

  async function toggleEditingName() {
    if (editingName) {
      await saveName()
      editingName = false
    } else {
      editingName = true
      await delay(1)
      editNameElement.focus()
      editNameElement.select()
    }
  }

  async function handleNameBlur() {
    setTimeout(function() {
      editingName = false
    }, 100)
  }

  function handleNameKeydown(e) {
    if (e.code === 'Enter') {
      saveName()
      e.preventDefault()
      return
    }
    if (e.key === 'Escape') {
      editingName = false
      e.preventDefault()
      return
    }
  }

  //////////
  //* MEMO
  async function toggleEditingMemo() {
    console.log('CLICK')
    if (editingMemo) {
      await patchResult({ memo: newMemo })
      console.log('UPDATED')
    } else {
      editingMemo = true
      await delay(1)
      editMemoElement.focus()
      editMemoElement.select()
    }
  }

  function handleMemoBlur() {
    setTimeout(function() {
      editingMemo = false
    }, 100)
  }

  function handleMemoKeydown(e) {
    if (e.key === 'Escape') {
      editingMemo = false
      e.preventDefault()
    }
  }

  function handleRepredictClicked(e) {
    modalStore.trigger({
      type: 'component',
      component: 'predict',
      imageURI: imagePath,
      response: function (result) {
        if (result === 'error') {
          toastStore.trigger({
            message: 'Error: Something went wrong.',
            timeout: 5000,
            background: 'variant-filled-error',
          })
          return
        }
        if (result) {
          toastStore.trigger({
            message: `The task was accepted as "${result.name}"`,
            timeout: 5000,
            autohide: true,
            background: 'variant-filled-primary',
            action: {
              label: 'See tasks',
              response: () => goto('/results')
            }
          })
          return
        }
      }
    })
  }

  function handleUMAPClicked() {
    modalStore.trigger({
      type: 'component',
      component: 'umap',
      result: result,
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
      <h3>Actions</h3>
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

        <!-- BEGIN EDITING -->
        <div class="grow" class:hidden={!editingName}>
          <input
            type="text"
            class="p-0 block w-full"
            bind:value={ newName }
            bind:this={ editNameElement }
            on:blur={ handleNameBlur }
            on:keydown={ handleNameKeydown }
          >
        </div>
        <!-- END EDITING -->

        <!-- BEGIN NOT EDITING -->
        <div class="grow" class:hidden={editingName}>
          <button class="text-left block" on:click={ toggleEditingName }>{ result.name }</button>
        </div>
        <!-- END NOT EDITING -->

        <button on:click={ toggleEditingName } class="block">
          <span class="text-lg i-mdi-pencil"
            class:i-mdi-pencil={ !editingName }
            class:i-mdi-check={ editingName }
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

          <!-- BEGIN EDITING -->
          <textarea
            class="w-full block p-0"
            class:hidden={ !editingMemo }
            bind:this={ editMemoElement }
            on:blur={ handleMemoBlur }
            rows="3" bind:value={newMemo} on:keydown={ handleMemoKeydown }
          ></textarea>
          <!-- BEGIN EDITING -->
          {#if !editingMemo}
            {#if result.memo}
              <button class="block text-left" on:click={ toggleEditingMemo }>{ result.memo }</button>
            {:else}
              <button
                class="text-surface-500 grow"
                on:click={ toggleEditingMemo }
              >
                [Click to add memo]
              </button>
            {/if}
          {/if}
        </div>

        <button on:click={ toggleEditingMemo } class="block">
          <span class="block align-text-top h-full">
            <span class="text-lg"
              class:i-mdi-pencil={ !editingMemo }
              class:i-mdi-check={ editingMemo }
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
