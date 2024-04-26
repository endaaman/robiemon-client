<script>
	import '../../app.postcss';
	import 'cropperjs/dist/cropper.css'
	import { SlideToggle, getModalStore, RangeSlider } from '@skeletonlabs/skeleton';
	import { getContext, onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'
	import { browser } from '$app/environment'
	import { debounce } from '$lib'
	import Divider from '$lib/components/divider.svelte'
	import { LS_PRED_BT_MODEL, LS_PRED_BT_CAM, LS_PRED_SCALE } from '$lib/const'
  import { API_BASE } from '$lib/config'


  const status = getContext('status')

	export let parent
	let cropper
	let imageElement
  let processing = false
	let mode = 'bt'
  let scale = browser && parseFloat(localStorage.getItem(LS_PRED_SCALE)) || 1.0
	let extra = {
		bt: {
			cam: browser && localStorage.getItem(LS_PRED_BT_CAM) === 'on' || false,
			model: browser && localStorage.getItem(LS_PRED_BT_MODEL) || $status.bt_models[0].name,
		}
	}

	let imageWidth
	let imageHeight

	const modalStore = getModalStore()

  function handleImageLoaded() {
    if (imageElement) {
      imageWidth = imageElement.clientWidth
      imageHeight = imageElement.clientHeight
    }
  }

	function closeCropper() {
		if (cropper) {
			cropper.destroy()
		}
	}

	function updateCropper() {
		closeCropper()
		if (!imageElement) {
			return
		}
		cropper = new Cropper(imageElement, {
			autoCropArea: 1,
			highlight: false,
			modal: false,
			crop(event) {
			},
		})
	}

	onMount(async () => {
		// Cropper = (await import('@jsuites/cropper')).default
		await tick()
		if (browser) {
			updateCropper()
		}

		window.addEventListener('resize', debounce(updateCropper, 500))
	})

	onDestroy(() => {
		closeCropper()
	})

	function handleResetClicked() {
		updateCropper()
	}

	$: if (extra.bt.model) localStorage.setItem(LS_PRED_BT_MODEL, extra.bt.model)
	$: localStorage.setItem(LS_PRED_BT_CAM, extra.bt.cam ? 'on' : 'off')
	$: localStorage.setItem(LS_PRED_SCALE, ''+scale)
	function handleScaleSelected(e) {
		if (e.target.value) {
			scale = e.target.value
		}
	}

	async function onFormSubmit() {
		processing = true
		let task = null
    try {
			task = await predictImage()
      $modalStore[0].response(task)
    } catch (error) {
			$modalStore[0].response('error')
    } finally {
      processing = false
    }
		modalStore.close()
	}

  async function predictImage() {
		let canvas = cropper.getCroppedCanvas()
		let imageURI = canvas.toDataURL()

    const blob = await fetch(imageURI).then(res => res.blob());
    const formData = new FormData();
    for (const [key, value] of Object.entries(extra[mode])) {
      formData.append(key, value);
    }
    formData.append('file', blob, 'webcam.png');
    formData.append('scale', scale);

		const response = await fetch(`${API_BASE}/${mode}/predict`, {
			method: 'POST',
			body: formData,
		})
		return await response.json()
  }
</script>

<style global>
	@import "cropperjs/dist/cropper.css";

	#img {
		/* This rule is very important, please don't ignore this */
		/* max-width: 100%; */
		/* max-height: 100%; */
		/* object-fit: contain; */
		display: block;
		max-width: 100%;
	}

	#input-scale::-webkit-outer-spin-button,
	#input-scale::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	#input-scale[type=number] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
	#input-scale:focus {
		outline: none;
	}
</style>

{#if $modalStore[0]}
	<!-- <div class="card p-4 shadow-xl" > -->
	<div id="pred-modal" class="card p-4 shadow-xl max-w-full h-max w-modal-wide" style="max-height: calc(100vh - 80px);">
		<header class="mb-4 flex flex-row align-middle items-center">
			<h3 class="text-2xl font-bold">Prediction</h3>

			<div class="ml-auto flex flex-row gap-4">
        <!-- <p class="align-middle">{ imageWidth } × { imageHeight } px</p> -->
				<label class="label">
					<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
						<div class="input-group-shim">Scale</div>
						<input id="input-scale" type="number" placeholder="Scale" class="w-[120px]" step='0.001'
							bind:value={ scale } />
						<select on:change={ handleScaleSelected }>
							{#each $status.scales as s}
                {#if s.enabled}
                  <option value={s.scale} selected={scale == s.scale}>{s.label} ({s.scale})</option>
                {/if}
							{/each}
						</select>
					</div>

					<!-- <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]"> -->
					<!-- 	<div class="input-group-shim">Scale</div> -->
					<!-- 	<input type="number" step="0.01" placeholder="Amount" class="w-[100px]" -->
					<!-- 		bind:value={ scale } on:change={ handleScaleChanged } /> -->
					<!-- 	<button class="variant-filled-surface"> -->
					<!-- 		<span class="i-mdi-help-circle text-xl mr-1"></span> -->
					<!-- 		<span>Help</span> -->
					<!-- 	</button> -->
					<!-- </div> -->
				</label>

				<button class="btn variant-ghost-surface" on:click={ handleResetClicked }>Reset</button>
			</div>
		</header>

		{#if $modalStore[0].imageURI}
			<div class="flex" style="max-height: calc(100vh - 240px);">
				<img
					id="img" alt="original"
					src={$modalStore[0].imageURI}
					class="object-scale-down"
					on:load={ handleImageLoaded }
					bind:this={ imageElement }
					>
			</div>
		{:else}
			<p>Image missing</p>
		{/if}

		<footer class="modal-footer mt-4 flex flex-row align-middle items-center gap-4">

			<label class="label">
				<select class="select variant-ghost-surface" bind:value={mode}>
					<option value="bt">Brain tumor</option>
					<option value="eosino" disabled>Eosino count</option>
				</select>
			</label>

			{#if mode === 'bt'}
				<!-- <pre>{ JSON.stringify(extra, 0, 2) }</pre> -->
				<label class="label">
					<select class="select" bind:value={extra.bt.model}>
						{#each $status.bt_models as m}
							<option value={m.name}>{m.label}</option>
						{/each}
					</select>
				</label>
				<SlideToggle name="bt-toggle" size="sm"
					bind:checked={ extra.bt.cam }
				>CAM</SlideToggle>
			{/if}

			<Divider class="ml-auto" />

			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive} w-24" on:click={onFormSubmit}>
        {#if processing}
          <span class="i-mdi-loading animate-spin"></span>
        {:else}
          Predict
        {/if}
			</button>
		</footer>
	</div>
{/if}
