<script>
  import '../app.postcss';
  import { onMount, onDestroy, tick } from 'svelte'
  import { PUBLIC_API_BASE } from '$env/static/public'

  import { Modal, getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore()

  let videoElement
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
    } catch (error) {
      console.error('Error accessing the webcam', error);
    }
  }

  function handleCameraChanged(e) {
    updateStream(e.target.value)
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
    formData.append('image', blob, 'webcam.png');

    try {
      const response = await fetch(`${PUBLIC_API_BASE}/predict`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Upload failed', error);
    }

  }


  onMount(async () => {
    cameras = await getCameras();
    if (cameras.length > 0) {
      updateStream(cameras[0].deviceId)
    }
  })
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
  { PUBLIC_API_BASE }
</div>
