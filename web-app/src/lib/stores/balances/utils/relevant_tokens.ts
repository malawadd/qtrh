import { getSubgraphClient } from '$lib/utils/get-clients';
import { Utils } from 'ktrh';

export default async function relevantTokens(
  forBalance: 'receivable' | 'splittable',
  userId: string,
) {
  const subgraph = getSubgraphClient();

  let assetIds: string[];

  if (forBalance === 'receivable') {
    assetIds = (await subgraph.getKtrhsReceiverSeenEventsByReceiverId(userId)).map((e) =>
      Utils.Asset.getAddressFromId(e.ktrhsSetEvent.assetId),
    );
  } else {
    const events = await Promise.all([
      subgraph.getGivenEventsByReceiverUserId(userId),
      subgraph.getSplitEventsByReceiverUserId(userId),
    ]);

    assetIds = events.flat().map((e) => Utils.Asset.getAddressFromId(e.assetId));
  }

  return new Set(assetIds);
}
