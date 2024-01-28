<script>
	import { setContext, onMount, onDestroy, tick } from 'svelte'
	import Cropper from 'cropperjs'

	let imageElement
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

</script>

<h1>About</h1>

<div class="bg-stone-700 w-full h-96 flex">
	<!-- <img id="image" src="http://localhost:8000/uploads/1706365947.png" alt="" bind:this={ imageElement } class="object-contain"> -->
	<img id="image" src="http://localhost:8000/uploads/1706427308.png" alt="" bind:this={ imageElement } class="object-scale-down">
</div>
