<script>
  import '../app.postcss';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment'
  import { onMount, onDestroy, tick, afterUpdate } from 'svelte'
	import {
    AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
    FileDropzone, Avatar, LightSwitch, RangeSlider,
    getModalStore, getToastStore,
	} from '@skeletonlabs/skeleton'

  import { LS_BRIGHTNESS } from '$lib/const'
	import { page } from '$app/stores'


  const modalStore = getModalStore()
  const toastStore = getToastStore()

  let videoElement = null
  let currentCameraId = null
  let cameras = []
  let canvas
  let files = []
  let brightness = 100

  $: if (currentCameraId && videoElement) {
    videoElement.style.filter = `brightness(${brightness}%)`
    localStorage.setItem(LS_BRIGHTNESS, brightness)
	}

  async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  async function updateStream(cameraId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameraId } }
      })
      videoElement.srcObject = stream
      currentCameraId = cameraId
    } catch (error) {
      console.error('Error accessing the webcam', error);
      toastStore.trigger({
        message: 'Warning: Failed to access any webcam',
        timeout: 5000,
        background: 'variant-filled-warning',
      })
    }
  }

  function closeStream() {
    const stream = videoElement.srcObject;
    if (!stream) {
      return
    }
    stream.getTracks().forEach(function(track) {
      track.stop()
    })
    videoElement.srcObject = null
  }

  function handleCameraChanged(e) {
    const cameraId = e.target.value
    if (cameraId != currentCameraId) {
      closeStream()
      updateStream(cameraId)
    }
  }

  function onModalResponded(r) {
    if (r === 'error') {
      toastStore.trigger({
        message: 'Error: Something went wrong.',
        timeout: 5000,
        background: 'variant-filled-error',
      })
      return
    }

    if (r) {
      const message = Array.isArray(r)
        ? `The tasks was accepted`
        : `The task was accepted as "${r.name}"`
      toastStore.trigger({
        message: message,
        // timeout: 7000,
        autohide: false,
        background: 'variant-filled-primary',
        action: {
          label: 'See tasks',
          response: () => {
            goto('/results')
          }
        }
      })
      return
    }
  }


  function openPredictModal(imageURI) {
    modalStore.trigger({
      type: 'component',
      component: 'predict',
      imageURI: imageURI,
      response: onModalResponded,
    })
  }

  async function handlePredictClicked() {
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    const context = canvas.getContext('2d')
    context.filter = getComputedStyle(videoElement).filter
    context.drawImage(videoElement, 0, 0)

    const imageURI = canvas.toDataURL('image/png')

    await tick();

    openPredictModal(imageURI)
  }

  function readFileToURI(image) {
    return new Promise((resolve) => {
      let reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onload = e => resolve(e.target.result)
    })
  }

  async function handleFilesSelected(e) {
    if (e.target.files.length === 1) {
      const imageURI = await readFileToURI(e.target.files[0])
      openPredictModal(imageURI)
      return
    }

    const imageURIs = await Promise.all(Array.from(e.target.files).map((f) => readFileToURI(f)))

    console.log(imageURIs)
    modalStore.trigger({
      type: 'component',
      component: 'predictMulti',
      imageURIs: imageURIs,
      response: onModalResponded,
    })
  }

  if (browser) {
    onMount(async function() {
      if (localStorage.hasOwnProperty(LS_BRIGHTNESS)) {
        brightness = localStorage.getItem(LS_BRIGHTNESS)
      }

      // afterUpdate(async () => {
      cameras = await getCameras();
      if (cameras.length > 0) {
        updateStream(cameras[0].deviceId)
      }

    })

    onDestroy(async function() {
      closeStream()
    })
  }

	export let data
</script>


<style lang="scss">
</style>

<!-- <pre>{ JSON.stringify($page, 0, 2) }</pre> -->
<!-- <pre>{ JSON.stringify(data, 0, 2) }</pre> -->

<div class="flex h-full">

  <div class="flex">
    <AppRail class="flex-none" slot="sidebar">
      <AppRailAnchor selected={ data.mode === 'webcam' } href="/">
        <svelte:fragment slot="lead">
          <span class="i-mdi-camera"></span>
        </svelte:fragment>
        <span>Camera</span>
      </AppRailAnchor>

      <AppRailAnchor selected={ data.mode === 'file' } href="/?mode=file">
        <svelte:fragment slot="lead">
          <span class="i-mdi-file-image"></span>
        </svelte:fragment>
        <span>File upload</span>
      </AppRailAnchor>
    </AppRail>
  </div>

  <div class="p-4 grow h-full flex flex-col" class:hidden={ data.mode !== 'webcam'}>
    <video bind:this={videoElement} autoplay class="object-left-top" style="max-height: calc(100vh - 160px);">
      <track kind="captions">
    </video>
    <canvas bind:this={canvas} class="hidden"></canvas>

    <div class="flex flex-row gap-4 mt-4 items-center">
      <label class="label">
        <select class="select" on:change={ handleCameraChanged }>
          {#each cameras as camera}
            <option value={camera.deviceId}>{camera.label || 'Camera ' + camera.deviceId}</option>
          {/each}
        </select>
      </label>

      <RangeSlider
        name="range-slider"
        min={0} max={200} step={1} bind:value={ brightness }
      ></RangeSlider>

      <button type="button" class="btn variant-filled" on:click={handlePredictClicked}>
        Predict
      </button>
    </div>
  </div>


  {#if data.mode === 'file'}
    <div class="p-4">
      <FileDropzone name="files" bind:files={files} on:change={handleFilesSelected} accept="image/*" multiple>
        <svelte:fragment slot="lead">
          <span class="text-4xl i-mdi-file-image"></span>
        </svelte:fragment>
        <svelte:fragment slot="message"><strong>Upload a file(s)</strong> or drag and drop</svelte:fragment>
        <svelte:fragment slot="meta">PNG, JPG, and GIF allowed.</svelte:fragment>
      </FileDropzone>
    </div>
  {/if}
</div>
