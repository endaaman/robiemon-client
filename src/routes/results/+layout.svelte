<script>
	import { page } from '$app/stores';
  import { getContext  } from 'svelte'
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import * as C from '$lib/const'

	const links = [
		{
			href: '/results',
			label: 'Tasks',
		}, {
			href: '/results/bt',
			label: 'Brain tumors',
		}
	]

	function matchHref(href, current) {
		if (href === '/results') {
			return current === href
		}
		return current.startsWith(href)
	}

  const connection = getContext('connection')

	async function handleReconnectClick() {
		$connection.connect()
	}
</script>


<div class="p-4">
	<TabGroup>
		{#each links as link}
			<TabAnchor href={ link.href } selected={ matchHref(link.href, $page.route.id) }>
				<span>{ link.label }</span>
			</TabAnchor>
		{/each}
	</TabGroup>

	<div class="mt-4">
		{#if $connection.status === C.CONNECTION_PENDING }

			<p>Loading</p>

		{:else if $connection.status === C.CONNECTION_DISCONNECTED }

			<p>Failed to connect server.</p>
			<p>Please notice to the system administrator.</p>
			<button class="btn variant-filled" on:click={ handleReconnectClick }>Re-connect server</button>

		{:else if $connection.status === C.CONNECTION_CONNECTED }

			<slot></slot>

		{/if}
	</div>

</div>
