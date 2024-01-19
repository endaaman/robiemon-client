<script>
import '../app.postcss';
import { initializeStores, Modal } from '@skeletonlabs/skeleton';
import ModalPredict from './modals/predict.svelte'

import {
	AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
	Avatar, LightSwitch,
} from '@skeletonlabs/skeleton'


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
				<div class="flex justify-left gap-4">
					<img src="/oharobi.png" width="32" alt="oharobi" />
					<strong class="text-xl uppercase">おはロビくん</strong>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn hover:variant-ghost text-lg"
					href="/"
				>
					<span class="i-mdi-home align-middle"></span> Home
				</a>

				<a
					class="btn hover:variant-ghost text-lg"
					href="/results"
				>
					<span class="i-mdi-table align-middle"></span> Results
				</a>

				<a
					class="btn hover:variant-ghost text-lg"
					href="/about"
				>
					<span class="i-mdi-info align-middle"></span> About
				</a>

				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->

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


	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->

	<div class="p-4">
		<slot />
	</div>

	<svelte:fragment slot="pageFooter"></svelte:fragment>
</AppShell>
