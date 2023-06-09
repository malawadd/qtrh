<script lang="ts">
  import TokensIcon from 'design-system/icons/Orgs.svelte';
  import UserIcon from 'design-system/icons/User.svelte';

  import AccountMenuItem from '$lib/components/account-menu/components/account-menu-item.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import Token from '$lib/components/token/token.svelte';
  import StreamIcon from 'design-system/icons/TokenStreams.svelte';
  import { type Item, SearchItemType } from '../search';
  import wallet from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';

  export let item: Item;
  export let highlighted: string;

  $: highlightPlainText = highlighted.replace(/<\/?[^>]+(>|$)/g, '');
</script>

{#if item.type === SearchItemType.STREAM}
  <AccountMenuItem
    on:click
    icon={StreamIcon}
    href={`/app/${item.item.sender.address}/tokens/${item.item.ktrhsConfig.amountPerSecond.tokenAddress}/streams/${item.item.ktrhsConfig.ktrhId}`}
  >
    <div class="icon" slot="title">
      <div class="highlighted">
        <span style="color: var(--color-foreground)">
          {#if highlightPlainText !== item.item.name}
            Stream ID:
          {/if}
        </span>{@html highlighted}
      </div>
      {#if highlightPlainText !== item.item.name && item.item.name}<div class="typo-text-small">
          {item.item.name}
        </div>{/if}
    </div>
  </AccountMenuItem>
{:else if item.type === SearchItemType.TOKEN}
  <AccountMenuItem
    on:click
    href={`/app/${$wallet.address ?? unreachable()}/tokens/${item.item.info.address}`}
  >
    <div class="icon" slot="left">
      <Token show="none" size="huge" address={item.item.info.address} />
      <div class="badge"><TokensIcon style="height: 1rem; fill: var(--color-foreground)" /></div>
    </div>
    <svelte:fragment slot="title">
      <div class="highlighted">{@html highlighted}</div>
      {#if highlightPlainText !== item.item.info.name}<div class="typo-text-small">
          {item.item.info.name}
        </div>{/if}
    </svelte:fragment>
  </AccountMenuItem>
{:else if item.type === SearchItemType.PROFILE}
  <AccountMenuItem
    icon={item.item.address ? undefined : UserIcon}
    on:click
    href={`/app/${item.item.name ?? item.item.address ?? item.item.ktrhsUserId}`}
  >
    <div class="icon" slot="left">
      {#if item.item.address}<IdentityBadge
          disableLink={true}
          size="big"
          address={item.item.address}
          showIdentity={false}
        />{/if}
      <div class="badge"><UserIcon style="height: 1rem; fill: var(--color-foreground)" /></div>
    </div>
    <svelte:fragment slot="title">
      <div class="highlighted">
        <span style="color: var(--color-foreground)">
          {#if !item.item.name && !item.item.address && item.item.ktrhsUserId}
            Jump to user ID:
          {/if}
        </span>
        {@html highlighted}
      </div>
      {#if highlightPlainText !== item.item.name && item.item.name}<div class="typo-text-small">
          {item.item.name}
        </div>{/if}
    </svelte:fragment>
  </AccountMenuItem>
{/if}

<style>
  .highlighted {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .badge {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    height: 1.5rem;
    width: 1.5rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 0.75rem;
    bottom: -0.25rem;
    right: -0.25rem;
  }

  .icon {
    position: relative;
  }
</style>
