<script>
  import '../app.postcss';
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import { browser } from '$app/environment'
  import { onMount, onDestroy, tick, } from 'svelte'
  import { fade } from 'svelte/transition'
  import {
    AppRail, AppRailAnchor, FileDropzone,  RangeSlider,
    getModalStore, getToastStore,
  } from '@skeletonlabs/skeleton'

  import { LS_BRIGHTNESS } from '$lib/const'

  export let data

  const modalStore = getModalStore()
  const toastStore = getToastStore()

  let mode = ''
  let videoElement = null
  let cameras = null
  let canvas
  let files = []
  let brightness = 100
  let mediaAllowed = null

  const currentCameraId = getContext('currentCameraId')

  $: {
    if (cameras) {
      if (data.mode == 'default') {
        mode = cameras.length > 0 ? 'webcam' : 'file'
      } else {
        mode = data.mode
      }
    }

    if ($currentCameraId && videoElement) {
      videoElement.style.filter = `brightness(${brightness}%)`
      localStorage.setItem(LS_BRIGHTNESS, brightness)
    }
  }

  async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  async function updateStream(cameraId) {
    try {
      const q = cameraId
        ? { deviceId: { exact: cameraId } }
        : { audio: false }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: q
      })
      cameras = await getCameras()
      mediaAllowed = true
      videoElement.srcObject = stream
      $currentCameraId = cameraId || cameras[0].deviceId
    } catch (error) {
      mediaAllowed = false
      console.log('ERROR', error)
      toastStore.trigger({
        message: 'Failed to access any webcam. Please check browser settings for this site.',
        timeout: 5000,
        background: 'variant-filled-warning',
      })
    }
  }

  function closeStream() {
    if (!videoElement) {
      return
    }
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
    if (cameraId != $currentCameraId) {
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

    await tick()

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
      cameras = await getCameras()
      if (cameras.length > 0) {
        updateStream($currentCameraId || null)
      }
    })

    onDestroy(async function() {
      closeStream()
    })
  }
</script>

<div class="flex h-full">
  <div class="flex">
    <AppRail class="flex-none" slot="sidebar">
      <AppRailAnchor selected={ mode === 'webcam' } href="/?mode=webcam">
        <svelte:fragment slot="lead">
          <span class="i-mdi-camera"></span>
        </svelte:fragment>
        <span>Camera</span>
      </AppRailAnchor>

      <AppRailAnchor selected={ mode === 'file' } href="/?mode=file">
        <svelte:fragment slot="lead">
          <span class="i-mdi-file-image"></span>
        </svelte:fragment>
        <span>File upload</span>
      </AppRailAnchor>
    </AppRail>
  </div>

  <div class="p-4 grow h-full flex flex-col" class:hidden={ mode !== 'webcam'}>
    <video
      bind:this={videoElement}
      autoplay
      class="object-left-top"
      class:hidden={!( mediaAllowed && cameras && cameras.length>0 )}
      style="max-height: calc(100vh - 160px);">
      <track kind="captions">
    </video>

    {#if mediaAllowed === true}
      {#if cameras}
        {#if cameras.length > 0 }
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
        {:else if cameras.length === 0 }
          <p>No cameras detected</p>
        {/if}
      {/if}
    {:else if mediaAllowed === false}
      <p class="mb-4">Webcam access denied. </p>
      <p>
        <button class="btn variant-filled" on:click={ updateStream }>Allow webcam access</button>
      </p>
    {:else}

      <div class="p-4 flex flex-col h-full justify-center items-center" transition:fade={{ duration: 300 }}>
        <span class="i-mdi-loading animate-spin text-[180px] text-secondary-300"></span>
      </div>

    {/if}
  </div>

  {#if mode === 'file'}
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
