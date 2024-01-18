<script>
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';

  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim,
  } from '@smui/drawer';
  import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';

  let active = 'Inbox'
  let drawerOpen = true
  let drawerVariant = 'dismissible'

  function handleResize() {
  }


  onMount(() => {
    window.addEventListener('resize', handleResize)
    // handleResize()
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('resize', handleResize)
    }
  })

</script>

<style>
/* These classes are only needed because the
    drawer is in a container on the page. */
  .drawer-container {
    position: relative;
    display: flex;
    width: 100vw;
    height: 100vh;
    border: 1px solid
      var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
    overflow: hidden;
    z-index: 0;
  }

  * :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  }

  .main-content {
    overflow: auto;
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
  }
</style>
<div class="drawer-container">
  <Drawer bind:variant={drawerVariant} bind:open={drawerOpen}>
    <Header>
      <Title>ロビえもん</Title>
      <Subtitle>AI病理診断システム</Subtitle>
    </Header>
    <Content>
      <List>
        <Item
          href="/"
          activated={ $page.route.id == '/' }
        >
          <Graphic class="material-icons" aria-hidden="true">home</Graphic>
          <Text>Home</Text>
        </Item>


        <Item
          href="/about"
          activated={ $page.route.id == '/about' }
        >
          <Graphic class="material-icons" aria-hidden="true">info</Graphic>
          <Text>About</Text>
        </Item>

        <Separator />

        <Subheader tag="h6">Results</Subheader>

        <Item
          href="/results/bt"
          activated={ $page.route.id == '/results/bt' }
        >
          <Graphic class="material-icons" aria-hidden="true">dataset</Graphic>
          <Text>Brain tumor</Text>
        </Item>

        <Item
          href="/results/eosino"
          activated={ $page.route.id == '/results/eosino' }
          disabled={ true }
        >
          <Graphic class="material-icons" aria-hidden="true">dataset</Graphic>
          <Text>Eosino counter</Text>
        </Item>

      </List>
    </Content>
  </Drawer>

  <AppContent class="app-content">
    <main class="main-content">
      <slot></slot>
    </main>
  </AppContent>

</div>
