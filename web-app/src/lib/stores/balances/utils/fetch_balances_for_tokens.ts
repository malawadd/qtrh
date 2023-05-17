import { getKtrhsHubClient } from '$lib/utils/get-clients';
import type { ReceivableBalance, SplittableBalance } from 'ktrh';

type BalanceType = 'receivable' | 'splittable';

type BalanceReturnType<T> = T extends 'receivable'
  ? ReceivableBalance
  : T extends 'splittable'
  ? SplittableBalance
  : never;

export default async function fetchBalancesForTokens<T extends BalanceType>(
  balance: T,
  tokens: Set<string>,
  userId: string,
): Promise<BalanceReturnType<T>[]> {
  const client = await getKtrhsHubClient();

  const promises = Array.from(tokens).map((ta) =>
    balance === 'receivable'
      ? client.getReceivableBalanceForUser(userId, ta, 1000)
      : client.getSplittableBalanceForUser(userId, ta),
  );

  return (await Promise.all(promises)) as BalanceReturnType<T>[];
}
