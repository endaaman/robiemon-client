<script>
	import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
	import { onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'
	import { browser } from '$app/environment'
	import { debounce } from '$lib'

	export let parent
	let cropper
	let withCam

	const modalStore = getModalStore()

	function closeCropper() {
		if (cropper) {
			cropper.destroy()
		}
	}

	function updateCropper() {
		closeCropper()
		const imageElement = document.getElementById('img')
		console.log(imageElement)
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
			withCam = localStorage.getItem('cam');
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
			localStorage.setItem('cam', withCam)
		}

		let canvas = cropper.getCroppedCanvas()
		let image = canvas.toDataURL()
		$modalStore[0].response({ image, withCam })
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

		<footer class="modal-footer flex mt-4 align-middle items-center">
			<button class="btn variant-ghost-surface" on:click={handleResetClicked}>Reset</button>

			<div class="ml-auto" >
				<SlideToggle name="slide" bind:checked={withCam}>Generate CAM</SlideToggle>
			</div>
			<button class="btn {parent.buttonNeutral} ml-2" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive} ml-2" on:click={onFormSubmit}>Predict</button>
		</footer>
	</div>
{/if}
