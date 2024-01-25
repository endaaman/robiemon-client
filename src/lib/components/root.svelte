<script>
	import '../app.postcss';
  import { browser } from '$app/environment'
	import { setContext, onMount, onDestroy } from 'svelte'
	import { writable } from 'svelte/store'
	import {
		AppShell, AppBar, AppRail, AppRailAnchor, AppRailTile,
		Avatar, LightSwitch,
	} from '@skeletonlabs/skeleton'
	import { initializeStores, Modal, Toast, getToastStore  } from '@skeletonlabs/skeleton'
	import { page } from '$app/stores'
  import { API_BASE } from '$lib/config'



	const links = [
		{
			icon: 'home',
			label: 'Home',
			href: '/',
		},
		// {
		// 	icon: 'predict',
		// 	label: 'Predict',
		// 	href: '/predict',
		// },zza
		{
			icon: 'table',
			label: 'Result',
			href: '/results',
		},
		// {
		// 	icon: 'info',
		// 	label: 'About',
		// 	href: '/about',
		// 	// match: () => $page.url.pathname == '/about',
		// 	match: () => false,
		// },
	]
</script>

<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/" class="flex justify-left gap-4 align-middle text-xl items-center">
					<Avatar src="/oharobi.png" width="w-12" rounded="rounded-full" />
					<strong>ロビえもん - AI病理診断システム</strong>
				</a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#each links as link}
					<a
						class="btn text-lg hover:variant-ghost"
						class:variant-ghost={ matchHref(link.href, $page.url.pathname) }
						href={link.href}
					>
						<span class="i-mdi-{link.icon} align-middle"></span> {link.label}
					</a>
				{/each}

				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>


	<svelte:fragment slot="sidebarLeft">
		<slot name="sidebar" />
	</svelte:fragment>


	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->

	<div class="p-4">
		<slot />
	</div>

	<svelte:fragment slot="pageFooter">
		<hr />
		<div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
			<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
				(C) Department of Cancer Pathology, Faculty of Medicine, Hokkaido University All rights reserverd.
			</span>
			<!--
			<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
				<li>
					<a href="#" class="hover:underline me-4 md:me-6">About</a>
				</li>
				<li>
					<a href="#" class="hover:underline me-4 md:me-6">Privacy Policy</a>
				</li>
				<li>
					<a href="#" class="hover:underline me-4 md:me-6">Licensing</a>
				</li>
				<li>
					<a href="#" class="hover:underline">Contact</a>
				</li>
			</ul>
			-->
		</div>
	</svelte:fragment>
</AppShell>
