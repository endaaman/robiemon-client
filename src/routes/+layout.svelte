<script>
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';

  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim,
  } from '@smui/drawer';
  import Button, { Label } from '@smui/button';
  import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';

  let drawerOpen = false;
  let active = 'Inbox';

  function setActive(value) {
    active = value;
    drawerOpen = false;
  }


  // 画面サイズに応じてドロワーの状態を制御する関数
  function handleResize() {
    if (window.innerWidth > 600) {
      drawerOpen = true; // 画面が大きい場合はドロワーを開く
    } else {
      drawerOpen = false; // 画面が小さい場合はドロワーを閉じる
    }
  }

  // コンポーネントがマウントされたらリサイズイベントリスナーを追加
  onMount(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // 初期表示時の状態も設定
  });

  // コンポーネントが破棄されたらイベントリスナーを削除
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('resize', handleResize);
    }
  });

</script>

<style>
  .drawer-container {
    position: relative;
    display: flex;
    height: 100vw;
    max-width: 100vw;
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
  <!-- Don't include fixed={false} if this is a page wide drawer.
        It adds a style for absolute positioning. -->
  <Drawer variant="modal" fixed={false} bind:open={drawerOpen}>
    <Header>
      <Title>Super Mail</Title>
      <Subtitle>It's the best fake mail app drawer.</Subtitle>
    </Header>
    <Content>
      <List>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Inbox')}
          activated={active === 'Inbox'}
        >
          <Graphic class="material-icons" aria-hidden="true">inbox</Graphic>
          <Text>Inbox</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Star')}
          activated={active === 'Star'}
        >
          <Graphic class="material-icons" aria-hidden="true">star</Graphic>
          <Text>Star</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Sent Mail')}
          activated={active === 'Sent Mail'}
        >
          <Graphic class="material-icons" aria-hidden="true">send</Graphic>
          <Text>Sent Mail</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Drafts')}
          activated={active === 'Drafts'}
        >
          <Graphic class="material-icons" aria-hidden="true">drafts</Graphic>
          <Text>Drafts</Text>
        </Item>

        <Separator />
        <Subheader tag="h6">Labels</Subheader>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Family')}
          activated={active === 'Family'}
        >
          <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
          <Text>Family</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Friends')}
          activated={active === 'Friends'}
        >
          <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
          <Text>Friends</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Work')}
          activated={active === 'Work'}
        >
          <Graphic class="material-icons" aria-hidden="true">bookmark</Graphic>
          <Text>Work</Text>
        </Item>
      </List>
    </Content>
  </Drawer>

  <!-- Don't include fixed={false} if this is a page wide drawer.
        It adds a style for absolute positioning. -->
  <Scrim fixed={false} />
  <AppContent class="app-content">
    <main class="main-content">
      <Button on:click={() => (drawerOpen = !drawerOpen)}>
        <Label>Toggle Drawer</Label>
      </Button>
      <br />
      <pre class="status">Active: {active}</pre>
      <slot></slot>
    </main>
  </AppContent>
</div>
