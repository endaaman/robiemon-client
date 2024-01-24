<script>
  import '../app.postcss';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment'
  import { onMount, onDestroy, tick, afterUpdate } from 'svelte'
  import { API_BASE } from '$lib/config'


  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore()
  const toastStore = getToastStore()

  let videoElement = null
  let currentCameraId = null
  let cameras = []
  let canvas
  let processing = false

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

  async function handelClick() {
    processing = true
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);

    const imageURI = canvas.toDataURL('image/png')

    await tick();

    modalStore.trigger({
      type: 'component',
      component: 'predict',
      imageURI: imageURI,
      response: (r) => {
        processing = false
        if (!r) {
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

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      // console.log(data)

      toastStore.trigger({
        message: 'Add a new task to predict',
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
  video {
    width: 100%;
    height: 100%;
  }
</style>


<div id="videoContainer">
  <video bind:this={videoElement} autoplay>
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

  <button type="button" class="btn variant-filled w-24" on:click={handelClick}>
    {#if processing}
      <span class="i-mdi-loading animate-spin"></span>
    {:else}
      Predict
    {/if}
  </button>
</div>
