<script>
import { redirect } from '@sveltejs/kit';

export function load() {
  redirect(302, '/results/bt')
}
</script>

<h1>Result</h1>
