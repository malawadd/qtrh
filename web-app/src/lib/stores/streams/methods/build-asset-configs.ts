import { AddressDriverClient, constants, Utils } from 'ktrh';
import type { z } from 'zod';
import type { accountMetadataSchema, assetConfigMetadataSchema } from '../metadata';
import type { AssetConfig, AssetConfigHistoryItem, KtrhsConfig, Receiver, Stream } from '../types';
import makeStreamId from './make-stream-id';
import assert from '$lib/utils/assert';
import matchMetadataStreamToReceiver from './match-metadata-stream-to-receiver';
import type { KtrhsSetEventWithFullReceivers } from './reconcile-Ktrhs-set-receivers';

function mapReceiverToStream(
  receiver: Receiver,
  senderUserId: string,
  tokenAddress: string,
  assetConfigMetadata?: z.infer<typeof assetConfigMetadataSchema>,
): Stream {
  const streamMetadata = assetConfigMetadata?.streams.find(
    (streamMetadata) => streamMetadata.id === receiver.streamId,
  );
  const initialKtrhsConfig = streamMetadata?.initialKtrhsConfig;

  const ktrhsConfig: KtrhsConfig | undefined =
    receiver.ktrhsConfig ||
    (initialKtrhsConfig && {
      ktrhId: initialKtrhsConfig.ktrhId,
      raw: BigInt(initialKtrhsConfig.raw),
      amountPerSecond: {
        amount: initialKtrhsConfig.amountPerSecond,
        tokenAddress,
      },
      startDate:
        initialKtrhsConfig.startTimestamp && initialKtrhsConfig.startTimestamp > 0
          ? new Date(initialKtrhsConfig.startTimestamp * 1000)
          : undefined,
      durationSeconds:
        initialKtrhsConfig.durationSeconds !== 0 ? initialKtrhsConfig.durationSeconds : undefined,
    });

  assert(
    ktrhsConfig,
    'Both stream metadata and on-chain data cannot have an undefined ktrhsConfig',
  );

  return {
    id: receiver.streamId,
    sender: {
      driver: 'address',
      userId: senderUserId,
      address: AddressDriverClient.getUserAddress(senderUserId),
    },
    receiver: receiver.receiver,
    ktrhsConfig,
    paused: !receiver.ktrhsConfig,
    managed: Boolean(streamMetadata),
    name: streamMetadata?.name,
    description: streamMetadata?.description,
    archived: streamMetadata?.archived ?? false,
  };
}

/**
 * Given accountMetadata and on-chain ktrhsSetEvents, construct an object describing
 * the account, including the full history of all its assetConfigs, with on-chain receivers
 * matched onto IPFS stream metadata.
 * @param userId The userId to build assetConfigs for.
 * @param accountMetadata The metadata for the given account fetched from IPFS.
 * @param ktrhsSetEvents The on-chain history of ktrhsSetEvents for the given account.
 * @returns The constructed Account object.
 * @throw An error if an assetConfig exists in metadata that no ktrhsSet events exist for.
 * @throw An error if any of the receivers existing onChain match multiple streams described
 * in metadata.
 */
export default function buildAssetConfigs(
  userId: string,
  accountMetadata: z.infer<typeof accountMetadataSchema> | undefined,
  ktrhsSetEvents: { [tokenAddress: string]: KtrhsSetEventWithFullReceivers[] },
) {
  return Object.entries(ktrhsSetEvents).reduce<AssetConfig[]>(
    (acc, [tokenAddress, assetConfigKtrhsSetEvents]) => {
      const assetConfigMetadata = accountMetadata?.assetConfigs.find(
        (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
      );

      assert(
        assetConfigKtrhsSetEvents && assetConfigKtrhsSetEvents.length > 0,
        `Unable to find ktrhsSet events for asset config with token address ${tokenAddress}`,
      );

      const assetConfigHistoryItems: AssetConfigHistoryItem[] = [];

      for (const ktrhsSetEvent of assetConfigKtrhsSetEvents) {
        const assetConfigHistoryItemStreams: Receiver[] = [];

        const remainingStreamIds =
          assetConfigMetadata?.streams.map((stream) =>
            makeStreamId(userId, tokenAddress, stream.initialKtrhsConfig.ktrhId),
          ) ?? [];

        for (const ktrhsReceiverSeenEvent of ktrhsSetEvent.currentReceivers) {
          const matchingStream = matchMetadataStreamToReceiver(
            ktrhsReceiverSeenEvent,
            assetConfigMetadata?.streams ?? [],
          );

          const eventConfig = Utils.KtrhsReceiverConfiguration.fromUint256(
            ktrhsReceiverSeenEvent.config,
          );

          const streamId = makeStreamId(userId, tokenAddress, eventConfig.ktrhId.toString());

          assetConfigHistoryItemStreams.push({
            streamId,
            ktrhsConfig: {
              raw: ktrhsReceiverSeenEvent.config,
              startDate:
                eventConfig.start > 0n ? new Date(Number(eventConfig.start) * 1000) : undefined,
              amountPerSecond: {
                amount: eventConfig.amountPerSec,
                tokenAddress,
              },
              ktrhId: eventConfig.ktrhId.toString(),
              durationSeconds: eventConfig.duration > 0n ? Number(eventConfig.duration) : undefined,
            },
            managed: Boolean(matchingStream),
            receiver: {
              address: AddressDriverClient.getUserAddress(ktrhsReceiverSeenEvent.receiverUserId),
              driver: 'address',
              userId: String(ktrhsReceiverSeenEvent.receiverUserId),
            },
          });

          remainingStreamIds.splice(remainingStreamIds.indexOf(streamId), 1);
        }

        /*
        If a particular stream doesn't appear within ktrhsReceiverSeenEvents of a given
        ktrhsSet event, but did at least once before, we can assume it is paused.
        */
        for (const remainingStreamId of remainingStreamIds) {
          const stream = assetConfigMetadata?.streams.find(
            (stream) => stream.id === remainingStreamId,
          );
          if (!stream) break;

          const streamExistedBefore = assetConfigHistoryItems.find((item) =>
            item.streams.find((stream) => stream.streamId === remainingStreamId),
          );

          if (streamExistedBefore) {
            assetConfigHistoryItemStreams.push({
              streamId: remainingStreamId,
              // Undefined ktrhsConfig == stream was paused
              ktrhsConfig: undefined,
              managed: true,
              receiver: {
                ...stream.receiver,
                address: AddressDriverClient.getUserAddress(stream.receiver.userId),
              },
            });
          }
        }

        let runsOutOfFunds: Date | undefined;

        // If maxEnd is the largest possible timestamp, all current streams end before balance is depleted.
        if (ktrhsSetEvent.maxEnd === 2n ** 32n - 1n) {
          runsOutOfFunds = undefined;
        } else if (ktrhsSetEvent.maxEnd === 0n) {
          runsOutOfFunds = undefined;
        } else {
          runsOutOfFunds = new Date(Number(ktrhsSetEvent.maxEnd) * 1000);
        }

        assetConfigHistoryItems.push({
          timestamp: new Date(Number(ktrhsSetEvent.blockTimestamp) * 1000),
          balance: {
            tokenAddress: tokenAddress,
            amount: ktrhsSetEvent.balance * BigInt(constants.AMT_PER_SEC_MULTIPLIER),
          },
          runsOutOfFunds,
          streams: assetConfigHistoryItemStreams,
          historyHash: ktrhsSetEvent.ktrhsHistoryHash,
          receiversHash: ktrhsSetEvent.receiversHash,
        });
      }

      const currentStreams = assetConfigHistoryItems[assetConfigHistoryItems.length - 1].streams;

      acc.push({
        tokenAddress: tokenAddress,
        streams: currentStreams.map((receiver) =>
          mapReceiverToStream(receiver, userId, tokenAddress, assetConfigMetadata),
        ),
        history: assetConfigHistoryItems,
      });

      return acc;
    },
    [],
  );
}
