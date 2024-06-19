<script>
  import format from 'date-fns/format'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { navigating } from '$app/stores'
  import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider, getToastStore, getModalStore,
  } from '@skeletonlabs/skeleton'

  import { API_BASE, STATIC_BASE } from '$lib/config'
  import Divider from '$lib/components/divider.svelte'
  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

  const camTypes = {
    normal: {
      filename: 'cam.png',
      blendMode: 'hard-light',
      // blendMode: 'multiply',
    },
    jet: {
      filename: 'cam_jet.png',
      // blendMode: 'hard-light',
      blendMode: 'multiply',
    },
    inferno: {
      filename: 'cam_inferno.png',
      // blendMode: 'hard-light',
      blendMode: 'multiply',
    },
  }

  const toastStore = getToastStore()
  const modalStore = getModalStore()

  const status = getContext('status')
  let result = $status.bt_results.find((r) => {
    return r.timestamp === parseInt($page.params.slug)
  })

  let imageElement = null
  let nameButtonElement = null
  let nameInputElement = null
  let memoButtonElement = null
  let memoTextareaElement = null
  let camType = 'normal'

  let newerResult = null
  let olderResult = null
  let modelName = result.moden
  let imagePath = null
  let camPath = null

  let editingName = false
  let editingMemo = false
  let newName = result.name
  let newMemo = result.memo
  let opacity = 0

  function updateResult() {
    newerResult = null
    olderResult = null
    $status.bt_results.forEach((r, i) => {
      if (result.timestamp === r.timestamp) {
        if (i >= 1) {
          olderResult = $status.bt_results[i-1]
        }
        if (i <= $status.bt_results.length-2) {
          newerResult = $status.bt_results[i+1]
        }
      }
    })
    editingName = false
    editingMemo = false
    newName = result.name
    newMemo = result.memo
    // あえて更新しない
    // opacity = 0

    imagePath = `${STATIC_BASE}/results/bt/${result.timestamp}/original.jpg`
    const m = $status.bt_models.find((m)=> m.name === result.model)
    modelName = m ? m.label : result.model
  }

  updateResult()

  $: {
    result = $status.bt_results.find((r) => {
      return r.timestamp === parseInt($page.params.slug)
    })
    if ($navigating) {
      updateResult()
    }

    camPath = result.with_cam
      ? `${STATIC_BASE}/results/bt/${result.timestamp}/${camTypes[camType].filename}`
      : ''
    handleImageLoaded()
  }

  let naturalWidth = 0
  let naturalHeight = 0
  let imageWidth = 0
  let imageHeight = 0

  function handleImageLoaded() {
    if (imageElement) {
      imageWidth = imageElement.clientWidth
      imageHeight = imageElement.clientHeight
      naturalWidth = imageElement.naturalWidth
      naturalHeight = imageElement.naturalHeight
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
    result.name = newName
  }

  function handleNameInputFocus() {
    editingName = true
  }

  function handleNameInputBlur() {
    editingName = false
    setTimeout(async function() {
      if (document.activeElement === nameButtonElement) {
        await saveName()
      } else {
        newName = result.name
      }
    }, 100)
  }

  function handleNameKeydown(e) {
    if (e.code === 'Enter') {
      saveName()
      e.preventDefault()
      nameInputElement.blur()
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
  async function saveMemo() {
    await patchResult({ memo: newMemo })
    result.memo = newMemo
  }

  async function handleMemoClicked() {
    editingMemo = true
    await tick()
    memoTextareaElement.focus()
  }

  function handleMemoFocus() {
    editingMemo = true
  }

  async function handleMemoBlur() {
    setTimeout(async function() {
      console.log(document.activeElement)
      if (document.activeElement === memoButtonElement) {
        await saveMemo()
      } else {
        newMemo = result.memo
      }
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

  function handleKeydown(e) {
    if (['INPUT', 'TEXTAREA','SELECT'].includes(e.target.tagName)) {
      return
    }
    if (e.key == 'ArrowLeft') {
      if (newerResult) {
        goto(`/results/bt/${newerResult.timestamp}`)
      }
    }
    if (e.key == 'ArrowRight') {
      if (olderResult) {
        goto(`/results/bt/${olderResult.timestamp}`)
      }
    }
  }

  if (browser) {
    onMount(async () => {
      document.addEventListener('keydown', handleKeydown)
      window.addEventListener('resize', handleImageLoaded)
    })
    onDestroy(() => {
      document.removeEventListener('keydown', handleKeydown)
    })
  }
</script>

<div class="flex overflow-x-auto mt-4 flex gap-4">
  <a href="/results/bt" class="btn variant-ghost-surface flex-none">
    <span class="i-mdi-format-list-bulleted-square"></span>
    <span>Back to list</span>
  </a>
  {#if result }
    <Divider color="surface-400 flex-none" />

    <div class="btn-group variant-ringed-surface flex-none">
      {#if newerResult}
        <a href="/results/bt/{newerResult.timestamp}">
          <span class="i-mdi-chevron-left"></span>
          <span>Newer</span>
        </a>
      {:else}
        <button disabled>
          <span class="i-mdi-chevron-left"></span>
          <span>Newer</span>
        </button>
      {/if}
      <!-- <a href="/results/bt"> -->
      <!--   <span class="i-mdi-format-list-bulleted-square"></span> -->
      <!--   <span>Back to list</span> -->
      <!-- </a> -->
      {#if olderResult}
        <a href="/results/bt/{olderResult.timestamp}">
          <span>Older</span>
          <span class="i-mdi-chevron-right"></span>
        </a>
      {:else}
        <button disabled>
          <span>Older</span>
          <span class="i-mdi-chevron-right"></span>
        </button>
      {/if}
    </div>
  {/if}
</div>


<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
  <div class="md:grid-cols-1 lg:col-span-2">
    <div class="relative w-full">
      <img
        src={imagePath}
        alt="original_{result.timestamp}"
        bind:this={ imageElement }
        on:load={ handleImageLoaded }
      >
      {#if camPath}
        <div
          class="absolute left-0 top-0"
          style="background-size: 100% 100%; background-image: url({camPath}); opacity: {opacity/100}; width: {imageWidth}px; height: {imageHeight}px; mix-blend-mode: {camTypes[camType].blendMode};"
        ></div>
      {/if}
    </div>

  </div>

  <div class="flex flex-col grid-cols-1 gap-6">
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

      <div class="flex space-x-3 items-center">

        <div class="font-semibold">Opacity</div>
        <RangeSlider
          name="range-slider"
          min={0} max={100} step={1} bind:value={ opacity }
          disabled={ !result.with_cam }
          class="flex-grow"
        ></RangeSlider>

        <select class="select text-sm p-1 w-24" bind:value={camType}>
          {#each Object.keys(camTypes) as c}}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </div>
    </section>


    <section>
      <h3>Data</h3>
      <hr class="my-2" />


      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Name</div>

        <div class="grow relative items-center">
          <input
            type="text"
            class="p-0 block w-full border-none bg-transparent focus:bg-white"
            class:cursor-pointer={ !editingName }
            bind:value={ newName }
            bind:this={ nameInputElement }
            on:focus={ handleNameInputFocus }
            on:blur={ handleNameInputBlur }
            on:keydown={ handleNameKeydown }
          >
          <button
            bind:this={ nameButtonElement }
            class="block absolute top-[2px] right-0"
            class:pointer-events-none={ !editingName }
          >
            <span class="text-lg i-mdi-pencil"
              class:i-mdi-pencil={ !editingName }
              class:i-mdi-check={ editingName }
            ></span>
          </button>
        </div>
      </div>

      <div class="flex flex-row my-2">
        <div class="w-24 min-w-24 font-semibold">Size</div>
        {#if naturalWidth}
          <div>{ naturalWidth } × { naturalHeight }px </div>
        {/if}
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

        {#if !editingMemo}
          <div class="flex space-x-1 w-full">
            <button
              class="block w-full text-left grow"
              class:text-surface-500={ !result.memo }
              on:click={ handleMemoClicked }
            >
              { result.memo ? result.memo : '[Click to add memo]'}
            </button>

            <button
              class="block align-top flex items-start text-lg"
              class:cursor-pointer={ editingMemo }
              on:click={ handleMemoClicked }
            >
              <span class="i-mdi-pencil"></span>
            </button>
          </div>
        {:else}
          <div class="flex space-x-1 grow">
            <textarea
              rows="3"
              class="w-full grow block p-0"
              bind:this={ memoTextareaElement }
              bind:value={newMemo}
              on:focus={ handleMemoFocus }
              on:blur={ handleMemoBlur }
              on:keydown={ handleMemoKeydown }
            ></textarea>
            <button class="block align-top flex items-start text-lg" bind:this={ memoButtonElement }>
              <span class="i-mdi-check"></span>
            </button>
          </div>
        {/if}

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
