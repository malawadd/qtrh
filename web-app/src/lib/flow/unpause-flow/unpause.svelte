<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import { getAddressDriverClient } from '$lib/utils/get-clients';
  import type { Stream } from '$lib/stores/streams/types';
  import streams from '$lib/stores/streams';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: Stream;

  onMount(() => {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { ktrhsUserId, address } = $wallet;
          assert(ktrhsUserId && address);

          const addressDriverClient = await getAddressDriverClient();

          const { tokenAddress } = stream.ktrhsConfig.amountPerSecond;

          const ownAccount = $streams.accounts[ktrhsUserId];
          assert(ownAccount, "App hasn't yet fetched user's own account");

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
          );
          assert(assetConfig, "App hasn't yet fetched the right asset config");

          const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
            stream.paused
              ? undefined
              : {
                  userId: stream.receiver.userId,
                  config: stream.ktrhsConfig.raw,
                },
          );

          const newReceivers = [
            ...currentReceivers,
            {
              userId: stream.receiver.userId,
              config: stream.ktrhsConfig.raw,
            },
          ];

          const tx = addressDriverClient.setKtrhs(
            tokenAddress,
            currentReceivers,
            newReceivers,
            address,
            0,
          );

          return { tx };
        },

        transactions: (transactContext) => ({
          transaction: () => transactContext.tx,
        }),

        after: async () => {
          await expect(
            streams.refreshUserAccount,
            () => streams.getStreamById(stream.id)?.paused === false,
            5000,
            1000,
          );
        },
      }),
    );
  });
</script>
