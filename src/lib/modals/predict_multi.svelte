<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
  import { ProgressBar } from '@skeletonlabs/skeleton'
  import { API_BASE } from '$lib/config'
	import { getContext } from 'svelte'

	const modalStore = getModalStore()
	export let parent
	let mode = 'bt'
  const status = getContext('status')

	let extra = {
		bt: {
			cam: browser && localStorage.getItem(LS_PRED_BT_CAM) === 'on' || false,
			weight: browser && localStorage.getItem(LS_PRED_BT_WEIGHT) || $status.bt_weights[0].weight,
		}
	}

  let processing = false
  let progress = 0

  async function onFormSubmit() {
    processing = true

    const tasks = []
    try {
      for (const imageURI of $modalStore[0].imageURIs) {
        const blob = await fetch(imageURI).then(res => res.blob())
        const formData = new FormData()
        formData.append('file', blob, 'image.png')
        formData.append('scale', 1.0)
        for (const [key, value] of Object.entries(extra[mode])) {
          formData.append(key, value);
        }
        const response = await fetch(`${API_BASE}/predict/${mode}`, {
          method: 'POST',
          body: formData,
        })
        tasks.push(await response.json())
      }

      $modalStore[0].response(tasks)
    } catch (error) {
      $modalStore[0].response('error')
    } finally {
      processing = false
      modalStore.close()
    }
  }

</script>


{#if $modalStore[0]}
	<div id="pred-modal" class="card p-4 shadow-xl">
		<header class="mb-4 flex flex-row align-middle items-center">
			<h3 class="text-2xl font-bold">Multiple prediction</h3>
    </header>
    <label class="label">
      Select mode
      <select class="select variant-ghost-surface" bind:value={mode}>
        <option value="bt">Brain tumor</option>
        <option value="eosino" disabled>Eosino count</option>
      </select>
    </label>

    <ProgressBar label="Progress" value={0} max={100} />

		<footer>
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive} w-24" on:click={onFormSubmit}>
        {#if processing}
          <span class="i-mdi-loading animate-spin"></span>
        {:else}
          Predict
        {/if}
			</button>
		</footer>
	</div>
{/if}
