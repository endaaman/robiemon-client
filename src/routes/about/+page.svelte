<script>
	import { setContext, onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'

	let cropper

	onMount(() => {
		return
		const image = document.getElementById('image');
		cropper = new Cropper(image, {
			// aspectRatio: 16 / 9,
			aspectRatio: image.width/image.height,
			crop(event) {
				console.log('event', event)
				// console.log(event.detail.x);
				// console.log(event.detail.y);
				// console.log(event.detail.width);
				// console.log(event.detail.height);
				// console.log(event.detail.rotate);
				// console.log(event.detail.scaleX);
				// console.log(event.detail.scaleY);
			},
		});
	})

	onDestroy(() => {
		if (cropper) {
			cropper.destroy()
		}
	})

	let imageElement
	let brightness = 50

	function handleFilesSelected(e) {
		let file = e.target.files[0]
		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function(event) {
				image.src = event.target.result;
				image.style.filter = `brightness(${brightness}%)`;
			};
		}
	}

	$: {
		if (imageElement) {
			imageElement.style.filter = `brightness(${brightness}%)`;
		}
	}

	function upload() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.filter = image.style.filter;
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		const imageData = canvas.toDataURL('image/png');
	}

</script>

<h1>About</h1>

<div>
	<input type="file" id="imageInput" accept="image/*" on:change={ handleFilesSelected }>
</div>

{#if}
	<div>
		<img id="image" style="max-width: 640px; height: auto;" alt="view" bind:this={ imageElement }>
	</div>
{/if}

<div>
	<input type="range" id="brightnessSlider" min="0" max="200" bind:value={ brightness }>
</div>

<button on:click={ upload }>Upload Adjusted Image</button>

<!-- <div class="bg-stone-700 w-full h-96 flex"> -->
<!-- 	<!-1- <img id="image" src="http://localhost:8000/uploads/1706365947.png" alt="" bind:this={ imageElement } class="object-contain"> -1-> -->
<!-- 	<img id="image" src="http://localhost:8000/uploads/1706427308.png" alt="" bind:this={ imageElement } class="object-scale-down"> -->
<!-- </div> -->
