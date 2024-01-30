<script>
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import { onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'
	import { browser } from '$app/environment'
	import { debounce } from '$lib'

	import Divider from '$lib/components/divider.svelte'

	const LS_BT_CAM = 'pred_modal_bt_cam'
	const LS_BT_WEIGHT = 'pred_modal_bt_weight'

	const models = [
		{
			label: 'ResNet RS50',
			value: 'bt_resnetrs50_f0.pt',
		},
		{
			label: 'EfficientNet B0',
			value: 'bt_efficientnet_b0_f0.pt',
		},
	]

	export let parent
	let cropper

	let mode = 'bt'
	let extra = {
		bt: {
			cam: false,
			weight: models[0].value,
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
		const imageElement = document.getElementById('img')
		cropper = new Cropper(imageElement, {
			autoCropArea: 1,
			// aspectRatio: 16 / 9,
			crop(event) {
			},
		})
	}

	onMount(async () => {
		await tick()
		updateCropper()

		window.addEventListener('resize', debounce(updateCropper, 500))

		if (browser){
			if (localStorage.hasOwnProperty(LS_BT_CAM)) {
				extra.bt.cam = localStorage.getItem(LS_BT_CAM)
			}
			if (localStorage.hasOwnProperty(LS_BT_WEIGHT)) {
				extra.bt.weight = localStorage.getItem(LS_BT_WEIGHT)
			}
		}
	})

	onDestroy(() => {
		closeCropper()
	})

	function handleResetClicked() {
		updateCropper()
	}

	function onFormSubmit() {
		if (browser){
			localStorage.setItem(LS_BT_CAM, extra.bt.cam)
			localStorage.setItem(LS_BT_WEIGHT, extra.bt.weight)
		}

		let canvas = cropper.getCroppedCanvas()
		let imageURI = canvas.toDataURL()
		$modalStore[0].response({ imageURI, mode, extra })
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
		<header class="text-2xl font-bold mb-4">Image confimation</header>

		<!-- <pre>{ JSON.stringify(parent, 0, 2) }</pre> -->

		{#if $modalStore[0].imageURI}
			<div class="flex" style="max-height: calc(100vh - 220px);">
				<img id="img" src={$modalStore[0].imageURI} alt="" class="object-scale-down">
			</div>
		{:else}
			<p>Image missing</p>
		{/if}

		<footer class="modal-footer flex mt-4 align-middle items-center gap-4">
			<button class="btn variant-ghost-surface" on:click={handleResetClicked}>Reset</button>

			<Divider />

			<label class="label">
				<select class="select variant-ghost-surface" bind:value={mode}>
					<option value="bt">Brain tumor</option>
					<option value="eosino" disabled>Eosino count</option>
				</select>
			</label>

			{#if mode === 'bt'}
				<label class="label">
					<select class="select" bind:value={extra.bt.weight}>
						{#each models as m}
							<option value={m.value}>{m.label}</option>
						{/each}
					</select>
				</label>
				<SlideToggle name="bt-toggle" bind:checked={extra.bt.cam} size="sm">CAM</SlideToggle>
			{/if}

			<Divider class="ml-auto" />

			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Predict</button>
		</footer>
	</div>
{/if}
