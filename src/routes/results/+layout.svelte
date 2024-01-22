<script>
import { page } from '$app/stores';
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

</script>

<TabGroup>
	{#each links as link}
		<TabAnchor href={ link.href } selected={ $page.route.id === link.href }>
			<span>{ link.label }</span>
		</TabAnchor>
	{/each}
</TabGroup>

<div class="mt-2">
	<slot></slot>
</div>
