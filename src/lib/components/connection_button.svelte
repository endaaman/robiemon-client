<script>
  import { getContext } from "svelte";
  import { popup, } from '@skeletonlabs/skeleton'
  import * as C from '$lib/const'
  import { fade, crossfade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

  const connection = getContext('connection')

  export let handler = function() {}
  export let loading = false

  let is_connected
  let fading = false
  $: {
    is_connected = $connection.status === C.CONNECTION_CONNECTED
  }
</script>

<button
  class="relative w-12 h-8 btn btn-sm {is_connected ? 'variant-ringed-primary' : 'variant-ringed-error'}"
  on:click={handler}
  title={is_connected ? 'Connected to the AI server.' : 'Click to connect again to the AI server'}
>
  {#if is_connected}
    {#if loading}
      <span transition:fade={{ delay:300, duration: 200 }}>
        <span class="absolute top-2 left-4 i-mdi-loading text-primary-500 animate-spin"></span>
      </span>
    {:else}
      {#if !fading}
        <span transition:fade={{ delay:300, duration: 200 }}>
          <span class="absolute top-2 left-4 i-mdi-lan-check text-primary-500"></span>
        </span>
      {/if}
    {/if}
  {:else}
    <span class="absolute i-mdi-lan-disconnect text-error-500"></span>
  {/if}
</button>

<!-- {#if } -->
<!--   <button class="btn btn-sm variant-ringed-primary" on:click={handler} use:popup={{ -->
<!--     event: 'hover', -->
<!--     target: 'popupHover', -->
<!--     placement: 'top' -->
<!--   }} title="Connected to the AI server."> -->
<!--     <span class="i-mdi-lan-check text-primary-500"></span> -->
<!--   </button> -->
<!--   <div class="card p-4 variant-filled-surface" on:click={handler} data-popup="popupHover"> -->
<!--     <p>Connected to the AI server.</p> -->
<!--     <div class="arrow variant-filled-surface" /> -->
<!--   </div> -->
<!-- {:else} -->
<!--   <button class="btn btn-sm " on:click={handler} use:popup={{ -->
<!--     event: 'hover', -->
<!--     target: 'popupHover', -->
<!--     placement: 'top' -->
<!--   }} on:click={ handler }  title="Click to connect again to the AI server"> -->
<!--     <span class="i-mdi-lan-disconnect text-error-500"></span> -->
<!--   </button> -->
<!--   <div class="card p-4 variant-filled-surface" data-popup="popupHover"> -->
<!--     <p>Click to try to connect the AI server again</p> -->
<!--     <div class="arrow variant-filled-surface" /> -->
<!--   </div> -->
<!-- {/if} -->
