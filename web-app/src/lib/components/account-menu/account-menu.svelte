<script>
  import wallet from '$lib/stores/wallet/wallet.store';
  import SettingsIcon from 'design-system/icons/Settings.svelte';
  import ServerIcon from 'design-system/icons/Server.svelte';
  import UserIcon from 'design-system/icons/User.svelte';

  import CrossIcon from 'design-system/icons/CrossSmall.svelte';
  import Button from '../button/button.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenuItem from './components/account-menu-item.svelte';
  import Divider from '../divider/divider.svelte';
  import ens from '$lib/stores/ens';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';

  $: safeAppMode = Boolean($wallet.safe);
</script>

<div class="account-menu">
  {#if $wallet.address}
    <AccountMenuItem>
      <svelte:fragment slot="left"
        ><IdentityBadge
          size="big"
          disableLink
          address={$wallet.address}
          showIdentity={false}
          disableSelection
        /></svelte:fragment
      >
      <svelte:fragment slot="title"
        ><IdentityBadge
          disableSelection
          disableLink
          address={$wallet.address}
          showAvatar={false}
        /></svelte:fragment
      >
      <svelte:fragment slot="right"
        ><Button disabled={safeAppMode} icon={CrossIcon} on:click={wallet.disconnect}
          >Disconnect</Button
        ></svelte:fragment
      >
    </AccountMenuItem>
    {#if safeAppMode}
      <div class="connected-to-safe">
        <AnnotationBox size="small" type="info">
          <div>
           
          </div>
        </AnnotationBox>
      </div>
    {/if}
    <Divider sideMargin={0.5} />
    <AccountMenuItem icon={ServerIcon} href="/app/dashboard">
      <svelte:fragment slot="title">Dashboard</svelte:fragment>
    </AccountMenuItem>
    
    
  {/if}
</div>

<style>
  .account-menu {
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
    padding: -0.5rem;
  }

  .connected-to-safe {
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
  }

  .connected-to-safe div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .links {
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .links > li {
    color: var(--color-foreground-level-6);
  }

  .links > li:not(:last-child)::after {
    margin-left: 0.5rem;
    content: '•';
  }

  .links a {
    text-decoration: underline;
  }
</style>
