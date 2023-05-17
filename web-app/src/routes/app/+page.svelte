<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import isSafePath from '$lib/utils/safe-path';

  const backTo = $page.url.searchParams.get('backTo');

  $: {
    if ($wallet.connected) {
      if (backTo) {
        const decoded = decodeURIComponent(backTo);
        const isSafe = isSafePath(decoded);

        if (isSafe) goto(decoded);
      } else {
        goto('/app/dashboard');
      }
    }
  }
</script>

<svelte:head>
  <title>Ktrh • Money streaming </title>
  <meta
    name="description"
    content="ktrh  is a Web3 toolkit that enables developers to stream money without any platform fees."
  />
</svelte:head>

<LargeEmptyState
  emoji="🌐"
  headline="Connect to Ktrh"
  description="Connect your wallet to view your Dashboard"
/>
