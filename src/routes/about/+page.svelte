<script>
	import { RangeSlider } from "@skeletonlabs/skeleton";
	let opacity = 0
</script>

<style>
	img {
		/* mask-mode: alpha; */

		/* mask-image: linear-gradient(black, transparent); */
		mask-image: url(/static/cams/1706761653.png);
		/* mask-image: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/sun.svg); */
		mask-mode: alpha;

		mask-position: center;
		mask-repeat: no-repeat;
	}

	.bg {
		background-image: url('/static/cams/1706761653.png');
	}

	#image-container {
		position: relative;

    /* background-image: url("/static/uploads/1706761653.png"); */
    /* position: absolute; */
    /* top: 0; */
    /* left: 0; */
    /* width: 600px; */
    /* height: 400px; */
    /* z-index: 1; */
	}

	#image-cam {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
		z-index: 2;

    background-image: url(/static/cams/1706761653.png);
		/* background-color: red; */
    mix-blend-mode: multiply;

	}
</style>


<h1>About</h1>

<div class="p-4">
	<div class="grid grid-cols-3 auto-rows-min gap-4">
		<div class="col-span-2">

			<div id="image-container">
				<img src="/static/uploads/1706761653.png" alt="org">
				<!-- <img id="image-cam" src="/static/cams/1706761653.png" alt="cam" style="opacity: {opacity/100};"> -->
				<div id="image-cam" style="opacity: {opacity/100};"></div>
			</div>

			<!-- <div class="bg w-[300px] h-[200px]"></div> -->

			<hr>
		</div>
		<div class="bg-primary-100">

      <RangeSlider
        name="opacity-slider"
        min={0} max={100} step={1} bind:value={ opacity }
      ></RangeSlider>

		</div>
	</div>
</div>

<!-- <img src="/static/cams/1706761653.png" alt="" -->
<!-- 	class="w-[600px]" style=""> -->

