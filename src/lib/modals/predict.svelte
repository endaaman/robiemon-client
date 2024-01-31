<script>
	import '../../app.postcss';
	import 'cropperjs/dist/cropper.min.css'
	import { SlideToggle, getModalStore, RangeSlider } from '@skeletonlabs/skeleton';
	import { getContext, onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'
	import { browser } from '$app/environment'
	import { debounce } from '$lib'
	import Divider from '$lib/components/divider.svelte'
	import { LS_PRED_BT_WEIGHT, LS_PRED_BT_CAM, LS_PRED_SCALE } from '$lib/const'


  const status = getContext('status')

	export let parent
	let cropper
	let imageElement
	let cropperWidth
	let cropperHeight
	let scale = 1.0

	let mode = 'bt'
	let extra = {
		bt: {
			cam: false,
			weight: '',
		}
	}

	const modalStore = getModalStore()

	function closeCropper() {
		if (cropper) {
			cropper.destroy()
		}
	}

	function updateCropper() {
		closeCropper()
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

		if (browser){
			if (localStorage.hasOwnProperty(LS_PRED_BT_WEIGHT)) {
				extra.bt.weight = localStorage.getItem(LS_PRED_BT_WEIGHT)
			}
			if (localStorage.hasOwnProperty(LS_PRED_BT_CAM)) {
				extra.bt.cam = localStorage.getItem(LS_PRED_BT_CAM) === 'on'
			}
			if (localStorage.hasOwnProperty(LS_PRED_SCALE)) {
				scale = localStorage.getItem(LS_PRED_SCALE)
			}
		}
	})

	onDestroy(() => {
		closeCropper()
	})

	function handleResetClicked() {
		updateCropper()
	}

	function handleWeightChanged(e) {
		localStorage.setItem(LS_PRED_BT_WEIGHT, e.target.value)
	}

	function handleCamChanged(e) {
		localStorage.setItem(LS_PRED_BT_CAM, e.target.checked ? 'on' : 'off')
	}
	function handleScaleChanged(e) {
		console.log(e.target.value)
		localStorage.setItem(LS_PRED_SCALE, e.target.value)
	}
	function handleScaleSelected(e) {
		if (e.target.value) {
			scale = e.target.value
		}
	}

	function onFormSubmit() {
		let canvas = cropper.getCroppedCanvas()
		let imageURI = canvas.toDataURL()
		$modalStore[0].response({ imageURI, scale, mode, extra })
		modalStore.close()
	}

</script>

<style>
	#img {
		/* This rule is very important, please don't ignore this */
		/* max-width: 100%; */
		/* max-height: 100%; */
		/* object-fit: contain; */
		display: block;
		max-width: 100%;
	}
</style>


{#if $modalStore[0]}
	<!-- <div class="card p-4 shadow-xl" > -->
	<div class="card p-4 shadow-xl max-w-full h-max w-modal-wide" style="max-height: calc(100vh - 80px);">
		<header class="mb-4 flex flex-row align-middle items-center">
			<h3 class="text-2xl font-bold">Image prediction</h3>


			<div class="ml-auto flex flex-row gap-4">
				<label class="label">
					<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
						<div class="input-group-shim">Scale</div>
						<input type="number" step="0.001" placeholder="Amount" class="w-[100px]"
							bind:value={ scale } on:change={ handleScaleChanged } />
						<select on:change={ handleScaleSelected }>
							<option>...</option>
							<option value="1.0">VS (1.0)</option>
							<option value="0.846">x10 (0.846)</option>
							<option value="0.423">x20 (0.423)</option>
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

				<button class="btn variant-filled-surface">Reset</button>
			</div>
		</header>

		{#if $modalStore[0].imageURI}
			<div class="flex" style="max-height: calc(100vh - 240px);">
				<img id="img" src={$modalStore[0].imageURI} alt="original"
					class="object-scale-down"
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
					<select class="select" bind:value={extra.bt.weight} on:change={ handleWeightChanged }>
						{#each $status.models as m}
							<option value={m.weight}>{m.label}</option>
						{/each}
					</select>
				</label>
				<SlideToggle name="bt-toggle" size="sm"
					bind:checked={ extra.bt.cam } on:change={ handleCamChanged }
				>CAM</SlideToggle>

			{/if}


			<Divider class="ml-auto" />

			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Predict</button>
		</footer>
	</div>
{/if}
