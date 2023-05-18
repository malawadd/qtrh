<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';

  import wallet from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';


  $: userId = $wallet.ktrhsUserId;

  $: {
    $wallet.connected;
    guardConnected();
  }

 
</script>

<svelte:head>
  <title>Dashboard | KTRH</title>
  <meta name="description" content="KTRH Dashboard" />
</svelte:head>

<div class="dashboard">
  <h1>Dashboard</h1>
  <div class="sections">
    <Balances {userId} disableActions={false} />
    <Streams {userId} disableActions={false} />
    
  </div>
</div>

<style>
  h4 {
    margin-bottom: 1.5rem;
  }

  .edu-carousel {
    margin: 0 -4rem;
  }

  .edu-carousel-inner {
    padding-top: 4rem;
  }

  .edu-carousel h4 {
    margin-left: 4rem;
  }

  .sections {
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
