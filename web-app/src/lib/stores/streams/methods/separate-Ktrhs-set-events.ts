import { Utils, type KtrhsSetEvent } from 'ktrhs';
import sortKtrhsSetEvents from './sort-ktrhs-set-events';


export default function seperateKtrhsSetEvents<T extends KtrhsSetEvent>(
  ktrhsSetEvents: T[],
): {
  [tokenAddress: string]: T[];
} {
  const sorted = sortKtrhsSetEvents(ktrhsSetEvents);

  const result = sorted.reduce<{ [tokenAddress: string]: T[] }>((acc, ktrhsSetEvent) => {
    const { assetId } = ktrhsSetEvent;
    const tokenAddress = Utils.Asset.getAddressFromId(assetId);

    if (acc[tokenAddress]) {
      acc[tokenAddress].push(ktrhsSetEvent);
    } else {
      acc[tokenAddress] = [ktrhsSetEvent];
    }

    return acc;
  }, {});

  return result;
}
