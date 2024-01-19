<script>
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let parent;

	const modalStore = getModalStore()

	function onFormSubmit() {
		// if ($modalStore[0].response) $modalStore[0].response(formData);
		$modalStore[0].response(true)
		modalStore.close();
	}
</script>


{#if $modalStore[0]}
	<div class="card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">Image confimation</header>

		<!-- <pre>{ JSON.stringify(parent, 0, 2) }</pre> -->

		{#if $modalStore[0].image}
			<img src={$modalStore[0].image} alt="">
		{:else}
			<p>Image missing</p>
		{/if}

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Submit Form</button>
		</footer>
	</div>
{/if}
