<script>
	import '../../app.postcss';
	import 'cropperjs/dist/cropper.css'
	import { SlideToggle, getModalStore, RangeSlider } from '@skeletonlabs/skeleton';
	import { getContext, onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'
	import { browser } from '$app/environment'
	import { debounce } from '$lib'
	import Divider from '$lib/components/divider.svelte'
	import { LS_PRED_BT_WEIGHT, LS_PRED_BT_CAM, LS_PRED_SCALE } from '$lib/const'


  const status = getContext('status')

	const scales = [
		{
			label: 'VS',
			scale: 1.0,
		}, {
			label: '10人鏡 x20',
			scale: 0.941,
		}, {
			label: '10人鏡 x10',
			scale: 1.8813,
		}, {
			label: 'HY-2307 x20',
			scale: 2.185,
		}, {
			label: 'HY-2307 x20',
			scale: 4.371,
		},
	]

	export let parent
	let cropper
	let imageElement
	let cropperWidth
	let cropperHeight

	let mode = 'bt'
	let extra = {
		bt: {
			cam: browser ? localStorage.getItem(LS_PRED_BT_CAM) === 'on' : false,
			weight: browser ? localStorage.getItem(LS_PRED_BT_WEIGHT) : '',
		}
	}
	let scale = browser ? parseFloat(localStorage.getItem(LS_PRED_SCALE)) : 1.0


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
	})

	onDestroy(() => {
		closeCropper()
	})

	function handleResetClicked() {
		updateCropper()
	}

	$: localStorage.setItem(LS_PRED_BT_WEIGHT, extra.bt.weight)
	$: localStorage.setItem(LS_PRED_BT_CAM, extra.bt.cam ? 'on' : 'off')
	$: localStorage.setItem(LS_PRED_SCALE, ''+scale)
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
</style>


{#if $modalStore[0]}
	<!-- <div class="card p-4 shadow-xl" > -->
	<div id="pred-modal" class="card p-4 shadow-xl max-w-full h-max w-modal-wide" style="max-height: calc(100vh - 80px);">
		<header class="mb-4 flex flex-row align-middle items-center">
			<h3 class="text-2xl font-bold">Image prediction</h3>

			<div class="ml-auto flex flex-row gap-4">
				<label class="label">
					<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
						<div class="input-group-shim">Scale</div>
						<input type="number" placeholder="Scale" class="w-[160px]" step='0.001'
							bind:value={ scale } />
						<select on:change={ handleScaleSelected }>
							{#each scales as s}
								<option value={s.scale} selected={scale == s.scale}>{s.label} ({s.scale})</option>
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

				<button class="btn variant-filled-surface" on:click={ handleResetClicked }>Reset</button>
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
					<select class="select" bind:value={extra.bt.weight}>
						{#each $status.models as m}
							<option value={m.weight}>{m.label}</option>
						{/each}
					</select>
				</label>
				<SlideToggle name="bt-toggle" size="sm"
					bind:checked={ extra.bt.cam }
				>CAM</SlideToggle>

			{/if}


			<Divider class="ml-auto" />

			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Predict</button>
		</footer>
	</div>
{/if}
