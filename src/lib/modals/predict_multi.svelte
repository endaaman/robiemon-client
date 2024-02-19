<script>
  import { browser } from '$app/environment'
	import { getModalStore } from '@skeletonlabs/skeleton';
  import { ProgressBar, SlideToggle } from '@skeletonlabs/skeleton'
  import { API_BASE } from '$lib/config'
	import { getContext } from 'svelte'
	import { LS_PRED_BT_WEIGHT, LS_PRED_BT_CAM, LS_PRED_SCALE } from '$lib/const'

	const modalStore = getModalStore()
	export let parent
	let mode = 'bt'
  const status = getContext('status')

	const scales = [
    {
      label: 'VS x20 440nm/px',
      scale: 1.0,
    }, {
      label: '10人鏡 x20',
      scale: 0.941,
    }, {
      label: '10人鏡 x10',
      scale: 1.8813,
    }, {
      label: 'HY-2307 x40',
      scale: 1.093,
    }, {
      label: 'HY-2307 x20',
      scale: 2.185,
    }, {
      label: 'HY-2307 x10',
      scale: 4.371,
    },
  ]

  let scale = browser && parseFloat(localStorage.getItem(LS_PRED_SCALE)) || 1.0
  let extra = {
    bt: {
      cam: browser && localStorage.getItem(LS_PRED_BT_CAM) === 'on' || false,
      weight: browser && localStorage.getItem(LS_PRED_BT_WEIGHT) || $status.bt_weights[0].weight,
    }
  }

  let processing = false
  let progress = 0

  const imageURIs = $modalStore[0].imageURIs

  async function predictImage(imageURI) {
    const blob = await fetch(imageURI).then(res => res.blob())
    const formData = new FormData()
    formData.append('file', blob, 'image.png')
    formData.append('scale', 1.0)
    for (const [key, value] of Object.entries(extra[mode])) {
      formData.append(key, value);
    }
    const response = await fetch(`${API_BASE}/predict/${mode}`, {
      method: 'POST',
      body: formData,
    })
    return await response.json()
  }

  async function onFormSubmit() {
    processing = true

    const tasks = []
    try {
      const tasks = await Promise.all(imageURIs.map((i) => predictImage(i)))
      // console.log(tasks)
      $modalStore[0].response(tasks)
    } catch (error) {
      $modalStore[0].response('error')
    } finally {
      processing = false
      modalStore.close()
    }
  }

  function handleScaleSelected(e) {
    if (e.target.value) {
      scale = e.target.value
    }
  }
</script>


{#if $modalStore[0]}
	<div id="pred-modal" class="card p-4 shadow-xl">
		<header class="mb-4 flex flex-row align-middle items-center">
			<h3 class="text-2xl font-bold">Multiple prediction</h3>
    </header>

    <article>
      <p>{imageURIs.length} images selected.</p>
    </article>

    <form class="modal-form space-y-4 ">

      <label class="label">
        Scale
        <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
          <input id="input-scale" type="number" placeholder="Scale" class="w-[120px]" step='0.001'
            bind:value={ scale } />
          <select on:change={ handleScaleSelected }>
            {#each scales as s}
              <option value={s.scale} selected={scale == s.scale}>{s.label} ({s.scale})</option>
            {/each}
          </select>
        </div>
      </label>

      <label class="label">
        Select mode
        <select class="select" bind:value={mode}>
          <option value="bt">Brain tumor</option>
          <option value="eosino" disabled>Eosino count</option>
        </select>
      </label>


			{#if mode === 'bt'}
        <div class="border border-surface-300 p-4 space-y-4 rounded-container-token">
          <!-- <pre>{ JSON.stringify(extra, 0, 2) }</pre> -->
          <label class="label">
            Model
            <select class="select" bind:value={extra.bt.weight}>
              {#each $status.bt_weights as m}
                <option value={m.weight}>{m.label}</option>
              {/each}
            </select>
          </label>
          <SlideToggle name="bt-toggle" size="sm"
            bind:checked={ extra.bt.cam }
          >CAM</SlideToggle>
        </div>
			{/if}

		</form>

    <hr class="my-4">

		<footer class="flex flex-row">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive} w-24 ml-auto" on:click={onFormSubmit}>
        {#if processing}
          <span class="i-mdi-loading animate-spin"></span>
        {:else}
          Predict
        {/if}
			</button>
		</footer>
	</div>
{/if}
