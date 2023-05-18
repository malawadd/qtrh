import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';

/**
 * Check if the currently logged-in user's AddressDriver ktrhsUserId matches
 * a particular ktrhsUserId.
 * @param ktrhsUserId The ktrhsUserId to match against.
 * @returns True if matches, false otherwise.
 */
export default function (ktrhsUserId: string): boolean {
  const { ktrhsUserId: currentKtrhsUserId } = get(wallet);

  return ktrhsUserId === currentKtrhsUserId;
}
