<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import LineItems from '$lib/components/line-items/line-items.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import {
    getAddressDriverClient,
    getCallerClient,
    getNetworkConfig,
    getSubgraphClient,
  } from '$lib/utils/get-clients';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import unreachable from '$lib/utils/unreachable';
  import type { Writable } from 'svelte/store';
  import type { CollectFlowState } from './collect-flow-state';
  import wallet from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import formatDate from '$lib/utils/format-date';
  import { AddressDriverPresets, constants, type CollectedEvent } from 'ktrh';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import balancesStore from '$lib/stores/balances/balances.store';
  import type { User } from '$lib/stores/streams/types';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import getSqueezeArgs from './get-squeeze-args';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import expect from '$lib/utils/expect';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';

  export let context: Writable<CollectFlowState>;

  const restorer = $context.restorer;

  $: cycle = $context.currentKtrhsCycle ?? unreachable();
  $: currentCycleEnd = new Date(cycle.start.getTime() + cycle.durationMillis);

  $: splitsConfig = $context.splitsConfig ?? unreachable();

  $: tokenAddress = $context.tokenAddress ?? unreachable();
  $: balances = $context.balances ?? unreachable();
  $: ownSplitsWeight = $context.ownSplitsWeight ?? unreachable();

  $: selectedToken = tokens.getByAddress($context.tokenAddress ?? '')?.info ?? unreachable();

  function makeAmount(fromBalance: bigint) {
    return {
      tokenAddress: tokenAddress ?? unreachable(),
      amount: fromBalance,
    };
  }

  interface StreamEstimateByReceiver {
    sender: User;
    amount: bigint;
  }

  $: incomingEstimatesBySender =
    $balancesStore &&
    balancesStore
      .getStreamEstimatesByReceiver('currentCycle', $wallet.ktrhsUserId ?? unreachable())
      .reduce<StreamEstimateByReceiver[]>((acc, streamEstimate) => {
        const senderAddress = streamEstimate.sender.address;
        const existingEntry = acc.find((e) => e.sender.address === senderAddress);

        if (existingEntry) {
          acc[acc.indexOf(existingEntry)] = {
            ...existingEntry,
            amount: existingEntry.amount + streamEstimate.totalStreamed,
          };
        } else {
          acc.push({
            sender: streamEstimate.sender,
            amount: streamEstimate.totalStreamed,
          });
        }

        return acc;
      }, []);

  let currentCycleSenders: Items;
  $: currentCycleSenders = Object.fromEntries(
    mapFilterUndefined(incomingEstimatesBySender, (estimate) => {
      if (estimate.amount === 0n) return;

      return [
        estimate.sender.userId,
        {
          type: 'selectable',
          label: {
            component: IdentityBadge,
            props: {
              address: estimate.sender.address,
              size: 'normal',
            },
          },
          text: `≈ ${formatTokenAmount(estimate.amount, selectedToken.decimals)} ${
            selectedToken.symbol
          }`,
        },
      ];
    }),
  );

  let squeezeEnabled = restorer.restore('squeezeEnabled');
  let selectedSqueezeSenderItems: string[] = restorer.restore('selectedSqueezeSenderItems');

  $: totalSelectedSqueezeAmount = squeezeEnabled
    ? selectedSqueezeSenderItems.reduce<bigint>(
        (acc, sender) =>
          acc +
          (incomingEstimatesBySender.find((e) => e.sender.userId === sender)?.amount ??
            unreachable()),
        0n,
      ) / BigInt(constants.AMT_PER_SEC_MULTIPLIER)
    : 0n;

  $: splittableAfterReceive =
    balances.receivable + balances.splittable + totalSelectedSqueezeAmount;
  $: collectableAfterSplit =
    (splittableAfterReceive * ownSplitsWeight) / 1000000n + balances.collectable;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  async function startCollect() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const callerClient = await getCallerClient();
          const addressDriverClient = await getAddressDriverClient();
          const userId = await addressDriverClient.getUserId();

          const { address: userAddress, signer } = $wallet;
          assert(userAddress);

          const { DRIPS_HUB, ADDRESS_DRIVER } = getNetworkConfig();

          let squeezeArgs: Awaited<ReturnType<typeof getSqueezeArgs>> | undefined;
          if (squeezeEnabled && selectedSqueezeSenderItems.length > 0) {
            squeezeArgs = await getSqueezeArgs(selectedSqueezeSenderItems, tokenAddress);
          }

          const collectFlow = await AddressDriverPresets.Presets.createCollectFlow({
            signer,
            squeezeArgs,
            driverAddress: ADDRESS_DRIVER,
            ktrhsHubAddress: DRIPS_HUB,
            userId,
            tokenAddress,
            // TODO: Replace with dynamic maxCycles
            maxCycles: 1000,
            currentReceivers: splitsConfig,
            transferToAddress: userAddress,
          });

          return {
            collectFlow,
            callerClient,
            userId,
          };
        },

        transactions: (transactContext) => ({
          transaction: () => transactContext.callerClient.callBatched(transactContext.collectFlow),
        }),

        after: async (receipts, transactContext) => {
          const receipt = receipts[0];
          const { provider } = $wallet;
          const { timestamp } = await provider.getBlock(receipt.blockNumber);
          assert(timestamp);

          const subgraph = getSubgraphClient();

          function findMatchingEvent(events: CollectedEvent[], timestamp: number) {
            return events.find((e) => e.blockTimestamp === BigInt(timestamp));
          }

          // Wait for the collect event to be indexed by the subgraph so we know how much was actually
          // collected.
          const expectation = await expect(
            async () => subgraph.getCollectedEventsByUserId(transactContext.userId),
            (collectedEvents) => Boolean(findMatchingEvent(collectedEvents, timestamp)),
            15000,
            1000,
          );

          const amountCollected = expectation.failed
            ? undefined
            : findMatchingEvent(expectation.result, timestamp)?.collected;

          context.update((c) => ({
            ...c,
            amountCollected,
            squeezeEnabled,
            receipt,
          }));

          // The squeeze event should be indexed by now, so this should cause the dashboard to update
          // in the background to reflect the newly reduced incoming balance.
          if (squeezeEnabled) await balancesStore.updateSqueezeHistory(transactContext.userId);
        },
      }),
    );
  }

  $: restorer.saveAll({
    squeezeEnabled,
    selectedSqueezeSenderItems,
  });
</script>

<StepLayout>
  <EmojiAndToken emoji="👛" {tokenAddress} animateTokenOnMount={splittableAfterReceive !== 0n} />
  <StepHeader headline={`Collect ${selectedToken.symbol}`} />
  <div>
    <p>
      Tokens streamed to your account automatically become receivable on a weekly cycle. Your
      receivable balance updates next on <span class="typo-text-bold"
        >{formatDate(currentCycleEnd)}</span
      >.
    </p>
    
  </div>
  <div class="squeeze-section">
    <Toggleable label="Include funds from current cycle" bind:toggled={squeezeEnabled}>
      <p>
        Select which senders from the current cycle you would like to collect from. The network fee
        for collecting increases with each selected sender.
      </p>
      <AnnotationBox type="warning">
        The amounts shown below are estimated based on your system time so the value you collect may
        slightly differ.
      </AnnotationBox>
      <div class="list-wrapper">
        <ListSelect
          items={currentCycleSenders}
          multiselect
          bind:selected={selectedSqueezeSenderItems}
          searchable={false}
        />
      </div>
    </Toggleable>
  </div>
  
  <SafeAppDisclaimer disclaimerType="ktrhs" />
  <svelte:fragment slot="actions">
    <Button
      variant="primary"
      disabled={splittableAfterReceive === 0n && balances.collectable === 0n}
      on:click={startCollect}>Collect {selectedToken.symbol}</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  p {
    color: var(--color-foreground-level-6);
    text-align: left;
  }

  .squeeze-section p {
    margin-bottom: 1rem;
  }

  a {
    color: var(--color-foreground-level-6);
    text-decoration: underline;
    display: block;
    margin-top: 0.5rem;
    text-align: left;
  }

  .list-wrapper {
    margin-top: 1rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>
