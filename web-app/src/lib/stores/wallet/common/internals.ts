/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */

import type { PopulatedTransaction, Signer } from 'ethers';
import { BigNumber } from 'ethers';
import { KtrhsErrors } from './KtrhsError';
import type { KtrhsReceiverStruct, SplitsReceiverStruct } from './types';

/** @internal */
export const nameOf = (obj: any) => Object.keys(obj)[0];

/** @internal */
export const isNullOrUndefined = (obj: any) => obj == null;

/** @internal */
export const formatKtrhsReceivers = (receivers: KtrhsReceiverStruct[]) => {
	// Ktrhs receivers must be sorted by user ID and config, deduplicated, and without amount per second <= 0.

	const uniqueReceivers = receivers.reduce((unique: KtrhsReceiverStruct[], o) => {
		if (
			!unique.some(
				(obj: KtrhsReceiverStruct) => obj.userId === o.userId && BigNumber.from(obj.config).eq(BigNumber.from(o.config))
			)
		) {
			unique.push(o);
		}
		return unique;
	}, []);

	const sortedReceivers = uniqueReceivers
		// Sort by userId.
		.sort((a, b) =>
			BigNumber.from(a.userId).gt(BigNumber.from(b.userId))
				? 1
				: BigNumber.from(a.userId).lt(BigNumber.from(b.userId))
				? -1
				: // Sort by config.
				BigNumber.from(a.config).gt(BigNumber.from(b.config))
				? 1
				: BigNumber.from(a.config).lt(BigNumber.from(b.config))
				? -1
				: 0
		);
	return sortedReceivers;
};

/** @internal */
export const formatSplitReceivers = (receivers: SplitsReceiverStruct[]): SplitsReceiverStruct[] => {
	// Splits receivers must be sorted by user ID, deduplicated, and without weights <= 0.

	const uniqueReceivers = receivers.reduce((unique: SplitsReceiverStruct[], o) => {
		if (!unique.some((obj: SplitsReceiverStruct) => obj.userId === o.userId && obj.weight === o.weight)) {
			unique.push(o);
		}
		return unique;
	}, []);

	const sortedReceivers = uniqueReceivers.sort((a, b) =>
		// Sort by user ID.
		BigNumber.from(a.userId).gt(BigNumber.from(b.userId))
			? 1
			: BigNumber.from(a.userId).lt(BigNumber.from(b.userId))
			? -1
			: 0
	);

	return sortedReceivers;
};

/** @internal */
export function ensureSignerExists(signer: Signer | undefined): asserts signer is NonNullable<Signer> {
	if (isNullOrUndefined(signer)) {
		throw KtrhsErrors.signerMissingError();
	}
}


export async function expect<T extends (() => any) | (() => Promise<any>)>(
	func: T,
	toMatchCondition: (result: Awaited<ReturnType<T>>) => boolean,
	within = 5000,
	checkingEvery = 1000
): Promise<
	| ReturnType<T>
	| {
			failed: true;
	  }
> {
	const numberOfChecks = Math.floor(within / checkingEvery);

	const checks = Array.from(Array(numberOfChecks).keys()).map(() => func);

	for (const check of checks) {
		const result = await check();

		if (toMatchCondition(result)) {
			return result;
		}

		await new Promise((r) => setTimeout(r, checkingEvery));
	}

	return {
		failed: true
	};
}

/** @internal */
export const safeKtrhsTx = (tx: PopulatedTransaction): PopulatedTransaction => {
	if (isNullOrUndefined(tx.value)) {
		// eslint-disable-next-line no-param-reassign
		tx.value = BigNumber.from(0);
	}

	return tx;
};
