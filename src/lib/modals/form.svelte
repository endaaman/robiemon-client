
<script>
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let parent;

	const modalStore = getModalStore();

	const formData = {
		name: 'Jane Doe',
		tel: '214-555-1234',
		email: 'jdoe@email.com'
	};

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit() {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}
</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
	<header class="text-2xl font-bold">{$modalStore[0].title ?? '(title missing)'}</header>
	<article>{$modalStore[0].body ?? '(body missing)'}</article>
	<!-- Enable for debugging: -->
	<form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
		<label class="label">
			<span>Name</span>
			<input class="input" type="text" placeholder="Enter name..." />
		</label>
		<label class="label">
			<span>Phone Number</span>
			<input class="input" type="tel" placeholder="Enter phone..." />
		</label>
		<label class="label">
			<span>Email</span>
			<input class="input" type="email" placeholder="Enter email address..." />
		</label>
	</form>
	<!-- prettier-ignore -->
	<footer class="modal-footer {parent.regionFooter}">
		<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
		<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Submit Form</button>
	</footer>
</div>
