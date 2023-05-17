import deduplicateArray from '$lib/utils/deduplicate-array';
import type { KtrhsSetEvent } from 'ktrhs';
import sortKtrhsSetEvents from './sort-ktrhs-set-events';

interface KtrhsReceiverSeenEvent {
  id: string;
  receiverUserId: string;
  config: bigint;
}

export type KtrhsSetEventWithFullReceivers = {
  currentReceivers: KtrhsReceiverSeenEvent[];
} & KtrhsSetEvent;

type ReceiversHash = string;


export function reconcileKtrhsSetReceivers(
  ktrhsSetEvents: KtrhsSetEvent[],
): KtrhsSetEventWithFullReceivers[] {
  const sortedKtrhsSetEvents = sortKtrhsSetEvents(ktrhsSetEvents);

  const receiversHashes = sortedKtrhsSetEvents.reduce<ReceiversHash[]>((acc, ktrhsSetEvent) => {
    const { receiversHash } = ktrhsSetEvent;

    return !acc.includes(receiversHash) ? [...acc, receiversHash] : acc;
  }, []);

  const ktrhsReceiverSeenEventsByReceiversHash = receiversHashes.reduce<{
    [receiversHash: string]: KtrhsReceiverSeenEvent[];
  }>((acc, receiversHash) => {
    const receivers = deduplicateArray(
      sortedKtrhsSetEvents
        .filter((event) => event.receiversHash === receiversHash)
        .reduce<KtrhsReceiverSeenEvent[]>(
          (acc, event) => [...acc, ...event.ktrhsReceiverSeenEvents],
          [],
        ),
      'config',
    );

    return {
      ...acc,
      [receiversHash]: receivers,
    };
  }, {});

  return sortedKtrhsSetEvents.reduce<KtrhsSetEventWithFullReceivers[]>(
    (acc, ktrhsSetEvent) => [
      ...acc,
      {
        ...ktrhsSetEvent,
        currentReceivers: ktrhsReceiverSeenEventsByReceiversHash[ktrhsSetEvent.receiversHash] ?? [],
      },
    ],
    [],
  );
}
