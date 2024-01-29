<script>
	import { page } from '$app/stores'
	import { getContext, onMount, onDestroy, tick } from 'svelte'
  import {
      RangeSlider, ConicGradient,
  } from '@skeletonlabs/skeleton'
  import * as THREE from 'three'

  import BtResultCircle from '$lib/components/bt_result_circle.svelte';
  import BtResultPredictions from '$lib/components/bt_result_predictions.svelte';

	// export let data;

	const status = getContext('status')
  let context

  let result = null
  let threshold = 50

  const image = new Image()
  let camImageElement
  let canvasElement

	$: result = $status.bt_results.find((r) => {
		return r.timestamp === parseInt($page.params.slug)
  })
  $: {
    if (result) {
      // draw()
      // image.src = `/cams/${result.cam_image}`
      // image.onload = function () {
      //   // canvasElement.width = image.width;
      //   // canvasElement.height = image.height;
      //   updateCanvas();
      // }
    }
  }
  // onMount(async () => {
  //   await tick()
  //   draw()
  // })
  function draw() {
    if (!canvasElement) {
      return
    }
    const scene = new THREE.Scene()

    // カメラの作成
    const camera = new THREE.PerspectiveCamera(
      75, canvasElement.offsetWidth / canvasElement.offsetHeight,
      0.1, 1000);
    camera.position.z = 5;

    // レンダラーの作成
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 画像の読み込み
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(`/uploads/${result.original_image}`);

    // メッシュの作成
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
  }

  function handleSliderChanged(e) {
      threshold = e.target.value / 100
      updateCanvas()
  }

  function updateCanvas() {
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(image, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        var value = (brightness >= threshold) ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
  }
</script>

<a href="/results/bt" class="btn variant-ghost-surface">
	<span class="i-mdi-format-list-bulleted-square"></span>
	<span>Back to list</span>
</a>

<!-- <pre>{ JSON.stringify(data, 0, 2) }</pre> -->
<!-- <pre>{ JSON.stringify($page, 0, 2) }</pre> -->

{#if result}
  <div class="mt-4 grid grid-cols-3 auto-rows-min gap-4">
    <div class="col-span-2">
      <!-- <canvas bind:this={canvasElement} class="w-full"></canvas> -->
      <div id="canvas" bind:this={canvasElement} style="width: 640px; height: 480;">a</div>

      <img src="/uploads/{result.original_image}" alt="original_{result.timestamp}">

      {#if result.cam_image}
        <img src="/cams/{result.cam_image}" alt="cam_{result.timestamp}" bind:this={camImageElement}>
      {/if}
    </div>
    <div>
      <h3>Prediction</h3>
      <hr class="my-2" />

      <div class="my-auto py-4 flex flex-row">
        <div class="w-2/3">
          <BtResultCircle result={ result }></BtResultCircle>
        </div>
        <div class="w-1/3">
          <BtResultPredictions result={ result }></BtResultPredictions>
        </div>
      </div>

      <h3>CAM Threshold</h3>
      <hr class="my-2" />
      <RangeSlider
        name="range-slider" on:change={ handleSliderChanged }
        min={0} max={100} step={1} value={50}
      ></RangeSlider>

      <pre>{ JSON.stringify(result, 0, 2) }</pre>
    </div>

  </div>
{:else}
	<p>Not found</p>
{/if}
