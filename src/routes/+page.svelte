<script>
  import '../app.postcss';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment'
  import { onMount, onDestroy, tick, afterUpdate } from 'svelte'
	import {
    AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
    FileDropzone, Avatar, LightSwitch,
	} from '@skeletonlabs/skeleton'
  import { API_BASE } from '$lib/config'


  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore()
  const toastStore = getToastStore()

  let videoElement = null
  let currentCameraId = null
  let cameras = []
  let canvas
  let processing = false
  let files = []
  let selectedTarget = 'webcam'

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

  async function handlePredictClicked() {
    processing = true
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    canvas.getContext('2d').drawImage(videoElement, 0, 0)

    const imageURI = canvas.toDataURL('image/png')

    await tick();

    modalStore.trigger({
      type: 'component',
      component: 'predict',
      imageURI: imageURI,
      response: (r) => {
        if (!r) {
          processing = false
          console.log('Canceled')
          return
        }
        predictImage(imageURI)
      }
    })

  }

  async function predictImage(imageURI) {
    const blob = await fetch(imageURI).then(res => res.blob());
    const formData = new FormData();
    formData.append('file', blob, 'webcam.png');

    console.log('start')
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      console.log(data)

      toastStore.trigger({
        message: `The task was accepted as "${data.tag}"`,
        timeout: 5000,
        background: 'variant-filled-primary',
        action: {
          label: 'See tasks',
          response: () => {
            goto('/results')
          }
        }
      })

    } catch (error) {
      console.log(error)
      toastStore.trigger({
        message: 'Error: Failed to connect server.',
        timeout: 5000,
        background: 'variant-filled-error',
      })
    } finally {
      processing = false
    }
  }

  function handleFilesSelected(e) {
    let image = e.target.files[0]
    let reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = e => {
      const imageURI = e.target.result
      modalStore.trigger({
        type: 'component',
        component: 'predict',
        imageURI: imageURI,
        response: (r) => {
          if (!r) {
            processing = false
            console.log('Canceled')
            return
          }
          predictImage(imageURI)
        }
      })
    }
  }

  if (browser) {
    onMount(async function() {
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
</script>


<style lang="scss">
</style>

<div class="flex h-full">

  <div class="flex">
    <AppRail class="flex-none" slot="sidebar">
      <AppRailTile bind:group={selectedTarget} name="tile-webcam" value="webcam" title="tile-webcam">
        <svelte:fragment slot="lead">
          <span class="i-mdi-camera"></span>
        </svelte:fragment>
        <span>Camera</span>
      </AppRailTile>

      <AppRailTile bind:group={selectedTarget} name="tile-file" value="file" title="tile-file">
        <svelte:fragment slot="lead">
          <span class="i-mdi-file-image"></span>
        </svelte:fragment>
        <span>File upload</span>
      </AppRailTile>
    </AppRail>
  </div>

  <div class="p-4 grow h-full flex flex-col" class:hidden={ selectedTarget !== 'webcam'}>
    <div id="videoContainer" class="grow">
      <video bind:this={videoElement} autoplay class="h-full">
        <track kind="captions">
      </video>
    </div>

    <canvas bind:this={canvas} class="hidden"></canvas>

    <div class="flex justify-left gap-4 mt-4">
      <label class="label">
        <select class="select" on:change={ handleCameraChanged }>
          {#each cameras as camera}
            <option value={camera.deviceId}>{camera.label || 'Camera ' + camera.deviceId}</option>
          {/each}
        </select>
      </label>

      <button type="button" class="btn variant-filled w-24" on:click={handlePredictClicked}>
        {#if processing}
          <span class="i-mdi-loading animate-spin"></span>
        {:else}
          Predict
        {/if}
      </button>
    </div>
  </div>


  {#if selectedTarget === 'file'}
    <div class="p-4">
      <FileDropzone name="files" bind:files={files} on:change={handleFilesSelected} accept="image/*">
        <svelte:fragment slot="lead">
          <span class="text-4xl i-mdi-file-image"></span>
        </svelte:fragment>
        <svelte:fragment slot="message"><strong>Upload a file</strong> or drag and drop</svelte:fragment>
        <svelte:fragment slot="meta">PNG, JPG, and GIF allowed.</svelte:fragment>
      </FileDropzone>
    </div>
  {/if}
</div>
