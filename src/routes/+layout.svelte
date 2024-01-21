<script>
import '../app.postcss';
import { page } from '$app/stores';
import { initializeStores, Modal } from '@skeletonlabs/skeleton';
import ModalPredict from './modals/predict.svelte'

import {
	AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
	Avatar, LightSwitch,
} from '@skeletonlabs/skeleton'

const links = [
	{
		icon: 'home',
		label: 'Home',
		href: '/',
	},
	{
		icon: 'table',
		label: 'Result',
		href: '/results',
	},
	{
		icon: 'info',
		label: 'About',
		href: '/about',
	},
]

function matchHref(href) {
	return href === $page.route.id
}


initializeStores()

const modalRegistry = {
	predict: { ref: ModalPredict },
};

let selectedTarget = 'bt'


</script>


<Modal components={modalRegistry} />

<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/" class="flex justify-left gap-4 align-middle text-xl items-center">
					<Avatar src="/oharobi.png" width="w-12" rounded="rounded-full" />
					<strong>ロビえもん - AI病理診断システム</strong>
				<a/>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#each links as link}
					<a
						class="btn text-lg hover:variant-ghost"
						class:variant-ghost="{$page.route.id === link.href}"
						href={link.href}
					>
						<span class="i-mdi-{link.icon} align-middle"></span> {link.label}
					</a>
				{/each}

				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!--
	<svelte:fragment slot="sidebarLeft">
		<AppRail>
			<AppRailTile bind:group={selectedTarget} name="tile-bt" value="bt" title="tile-bt">
				<svelte:fragment slot="lead">
					<span class="i-mdi-brain"></span>
				</svelte:fragment>
				<span>Brain tumor</span>
			</AppRailTile>

			<AppRailTile bind:group={selectedTarget} name="tile-eosino" value="eosino" title="tile-eosino">
				<svelte:fragment slot="lead">
					<span class="i-mdi-bacteria-outline"></span>
				</svelte:fragment>
				<span>Eosino</span>
			</AppRailTile>
		</AppRail>
	</svelte:fragment>
	-->

	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->

	<div class="p-4">
		<slot />
	</div>

	<svelte:fragment slot="pageFooter"></svelte:fragment>
</AppShell>
