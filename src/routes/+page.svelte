<script>
  import { onMount, onDestroy } from 'svelte'
  import Select, { Option } from '@smui/select'
  import Button, { Label, Icon } from '@smui/button'
  import CircularProgress from '@smui/circular-progress'

  let videoElement
  let cameras = []
  let selectedCameraId

  let processing = false

  async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  async function updateStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedCameraId } }
      })
      videoElement.srcObject = stream
    } catch (error) {
      console.error('Error accessing the webcam', error);
    }
  }

  function handleCameraChanged() {
    updateStream()
  }

  function handelClick() {
    console.log('Predict')
    processing = true
  }

  onMount(async () => {
    cameras = await getCameras();
    if (cameras.length > 0) {
      selectedCameraId = cameras[0].deviceId
      updateStream()
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

<div>
  <Select bind:value={selectedCameraId} on:SMUISelect:change={handleCameraChanged}>
    {#each cameras as camera}
      <Option value={camera.deviceId}>{camera.label || 'Camera ' + camera.deviceId}</Option>
    {/each}
  </Select>

  <Button on:click={handelClick} variant="raised" style="width: 140px;" variant="outlined">
    {#if processing}
      <div style="display: flex; justify-content: center">
        <CircularProgress style="height: 32px; width: 32px;" />
      </div>
      <Icon class="material-icons">progress</Icon>
    {:else}
      <Label>Predict</Label>
    {/if}
  </Button>

  <div style="display: flex; justify-content: center">
    <CircularProgress style="height: 32px; width: 32px;" indeterminate />
  </div>
</div>

