import wallet from '$lib/stores/wallet/wallet.store';
import { getSubgraphClient } from '$lib/utils/get-clients';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';

export default async function (senderUserIds: string[], tokenAddress: string) {
  const subgraphClient = getSubgraphClient();

  const { ktrhsUserId: ownUserId } = get(wallet);
  assert(ownUserId);

  return await Promise.all(
    senderUserIds.map((senderUserId) =>
      subgraphClient.getArgsForSqueezingAllKtrhs(ownUserId, senderUserId, tokenAddress),
    ),
  );
}
