<script>
  import { onMount, onDestroy } from 'svelte';
  import Select, { Option } from '@smui/select';

  let videoElement;
  let cameras = [];
  let selectedCameraId;

  onMount(async () => {
    cameras = await getCameras();
    if (cameras.length > 0) {
      selectedCameraId = cameras[0].deviceId;
      updateStream();
    }
  });

  async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  async function updateStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedCameraId } }
      });
      videoElement.srcObject = stream;
    } catch (error) {
      console.error('Error accessing the webcam', error);
    }
  }

  async function handleCameraChange() {
    updateStream();
  }


</script>


<style>
  /* #videoContainer {
    background-color: black;

    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  } */
</style>


<div id="videoContainer">
  <video bind:this={videoElement} autoplay>
    <track kind="captions">
  </video>
</div>

<Select bind:value={selectedCameraId} on:change={handleCameraChange}>
  {#each cameras as camera}
    <Option value={camera.deviceId}>{camera.label || 'Camera ' + camera.deviceId}</Option>
  {/each}
</Select>
