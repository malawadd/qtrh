import ens from '$lib/stores/ens';
import { getAddressDriverClient } from '$lib/utils/get-clients';
import { isAddress } from 'ethers/lib/utils';
import { AddressDriverClient } from 'ktrh';

export default async function (userId: string): Promise<{
  address: string;
  ktrhsUserId: string;
}> {
  if (isAddress(userId)) {
    const address = userId;
    const ktrhsUserId = await (await getAddressDriverClient()).getUserIdByAddress(userId);

    return {
      address,
      ktrhsUserId,
    };
  } else if (/^\d+$/.test(userId)) {
    // User ID param has only numbers and is probably a ktrhs user ID
    const ktrhsUserId = userId;
    const address = AddressDriverClient.getUserAddress(userId);

    return {
      address,
      ktrhsUserId,
    };
  } else if (userId.endsWith('.eth')) {
    const lookup = await ens.reverseLookup(userId);
    if (lookup) {
      const ktrhsUserId = await (await getAddressDriverClient()).getUserIdByAddress(lookup);
      const address = lookup;

      return {
        address,
        ktrhsUserId,
      };
    } else {
      throw new Error('Not found');
    }
  } else {
    throw new Error('Not found.');
  }
}
