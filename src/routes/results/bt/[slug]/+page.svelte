<script>
	import { page } from '$app/stores'
  import { getContext } from 'svelte'
  import Loaded from './loaded.svelte'

	const status = getContext('status')

	let result = null
	let loading = true
  let weights = $status.bt_weights

	$: result = $status.bt_results.find((r) => {
		loading = false
		return r.timestamp === parseInt($page.params.slug)
  })
</script>

<div class="mt-4">
  <a href="/results/bt" class="btn variant-ghost-surface">
    <span class="i-mdi-format-list-bulleted-square"></span>
    <span>Back to list</span>
  </a>
</div>

{#if result }
  <Loaded { result }></Loaded>
{:else}
  <p>Not found</p>
{/if}
