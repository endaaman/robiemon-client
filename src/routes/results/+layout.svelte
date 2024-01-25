<script>
	import { page } from '$app/stores';
  import { getContext  } from 'svelte'
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';

	const links = [
		{
			href: '/results',
			label: 'Tasks',
		}, {
			href: '/results/bt',
			label: 'Brain tumors',
		}
	]

  const connectionStatus = getContext('connectionStatus')

	async function handleReconnectClick() {
		// openConnection()
	}
</script>


<div class="p-4">
	<TabGroup>
		{#each links as link}
			<TabAnchor href={ link.href } selected={ $page.route.id === link.href }>
				<span>{ link.label }</span>
			</TabAnchor>
		{/each}
	</TabGroup>

	<div class="mt-2">
		{#if $connectionStatus === 'pending'}

			<p>Loading</p>

		{:else if $connectionStatus === 'error'}

			<p>Failed to connect server.</p>
			<p>Please notice to the system administrator.</p>
			<button class="btn variant-filled" on:click={ handleReconnectClick }>Re-connect server</button>

		{:else if $connectionStatus === 'connected'}

		<slot></slot>

		{/if}
	</div>

</div>
