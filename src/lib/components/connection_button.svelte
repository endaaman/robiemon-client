<script>
  import { getContext } from "svelte";
  import { popup, } from '@skeletonlabs/skeleton'
  import * as C from '$lib/const'

  const connection = getContext('connection')
</script>

{#if $connection.status === C.CONNECTION_CONNECTED}
  <button class="btn btn-sm variant-ringed-primary" use:popup={{
    event: 'hover',
    target: 'popupHover',
    placement: 'top'
  }}>
    <span class="i-mdi-lan-check text-primary-500"></span>
  </button>
  <div class="card p-4 variant-filled-surface" data-popup="popupHover">
    <p>Connected to the AI server.</p>
    <div class="arrow variant-filled-surface" />
  </div>
{:else}
  <button class="btn btn-sm variant-ringed-error" use:popup={{
    event: 'hover',
    target: 'popupHover',
    placement: 'top'
  }} on:click={ $connection.connect() }>
    <span class="i-mdi-lan-disconnect text-error-500"></span>
  </button>
  <div class="card p-4 variant-filled-surface" data-popup="popupHover">
    <p>Click to try to connect the AI server again</p>
    <div class="arrow variant-filled-surface" />
  </div>
{/if}
