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
</script>


<div class="p-4">
  <TabGroup>
    {#each links as link}
      <TabAnchor href={ link.href } selected={ matchHref(link.href, $page.route.id) }>
        <span>{ link.label }</span>
      </TabAnchor>
    {/each}
  </TabGroup>

  <slot></slot>

</div>
