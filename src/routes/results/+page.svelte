<script>
	// import { redirect } from '@sveltejs/kit';
	// export async function load() {
	//   throw redirect(302, '/results/bt')
	// }

  import { onMount, onDestroy, tick } from 'svelte'
  import { API_BASE } from '$lib/config'

  let eventSource = null
  let status = null

  onMount(async () => {
    eventSource = new EventSource(`${API_BASE}/status`);

    eventSource.onmessage = function(event) {
      status = JSON.parse(event.data)
    }

    eventSource.addEventListener("ping", function (event) {
      console.log(event)
    })

    eventSource.onerror = function (err) {
      console.error("EventSource failed:", err);
    }

  })

  onDestroy(async () => {
    // eventSource.close()
  });
</script>

<h1>Result</h1>
<p>{ `${API_BASE}/status` }</p>
{#if status}
<pre>{ JSON.stringify(status) }</pre>
{/if}
