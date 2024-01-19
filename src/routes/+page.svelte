<script>
  import '../app.postcss';
  import { onMount, onDestroy, tick } from 'svelte'

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

    const image = canvas.toDataURL('image/png');

    await tick();

    modalStore.trigger({
      type: 'component',
      component: 'predict',
      image: image,
      response: (r) => {
        processing = false
        if (!r) {
          console.log('Canceled')
          return
        }

        console.log('DO')
      }
    })

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
</div>
