<script>
	import { page } from '$app/stores'
  import { getContext } from 'svelte'
	import Divider from '$lib/components/divider.svelte'
  import Loaded from './loaded.svelte'

	const status = getContext('status')

	let result = null
  let newerResult = null
  let olderResult = null

  $: {
    result = $status.bt_results.find((r) => {
      return r.timestamp === parseInt($page.params.slug)
    })
    newerResult = null
    olderResult = null
    $status.bt_results.forEach((r, i) => {
      if (result.timestamp === r.timestamp) {
        if (i >= 1) {
          olderResult = $status.bt_results[i-1]
        }
        if (i <= $status.bt_results.length-2) {
          newerResult = $status.bt_results[i+1]
        }
      }
    })
  }
</script>

<div class="mt-4 flex gap-4">
  <a href="/results/bt" class="btn variant-ghost-surface">
    <span class="i-mdi-format-list-bulleted-square"></span>
    <span>Back to list</span>
  </a>
  {#if result }
    <Divider color='surface-400' />

    <div class="btn-group variant-ringed-surface">
      {#if newerResult}
        <a href="/results/bt/{newerResult.timestamp}">
          <span class="i-mdi-chevron-left"></span>
          <span>Newer</span>
        </a>
      {:else}
        <button disabled>
          <span class="i-mdi-chevron-left"></span>
          <span>Newer</span>
        </button>
      {/if}
      <!-- <a href="/results/bt"> -->
      <!--   <span class="i-mdi-format-list-bulleted-square"></span> -->
      <!--   <span>Back to list</span> -->
      <!-- </a> -->
      {#if olderResult}
        <a href="/results/bt/{olderResult.timestamp}">
          <span>Older</span>
          <span class="i-mdi-chevron-right"></span>
        </a>
      {:else}
        <button disabled>
          <span>Older</span>
          <span class="i-mdi-chevron-right"></span>
        </button>
      {/if}
    </div>
  {/if}

</div>

{#if result }
  <Loaded { result }></Loaded>
{:else}
  <p>Not found</p>
{/if}
