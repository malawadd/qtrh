import type { Provider } from '@ethersproject/providers';
import type { BigNumberish, Signer } from 'ethers';
import { ethers } from 'ethers';
import { KtrhsErrors } from './KtrhsError';
import { isNullOrUndefined, nameOf } from './internals';
import type { KtrhsReceiverConfig, SplitsReceiverStruct, KtrhsHistoryStruct, UserMetadata } from './types';

const MAX_KTRHS_RECEIVERS = 100;
const MAX_SPLITS_RECEIVERS = 200;

/** @internal */
export const validateAddress = (address: string) => {
	if (!ethers.utils.isAddress(address)) {
		throw KtrhsErrors.addressError(`Address validation failed: address '${address}' is not valid.`, address);
	}
};

/** @internal */
export const validateKtrhsReceiverConfig = (ktrhsReceiverConfig: KtrhsReceiverConfig): void => {
	if (!ktrhsReceiverConfig) {
		throw KtrhsErrors.argumentMissingError(
			`Ktrhs receiver config validation failed: '${nameOf({ ktrhsReceiverConfig })}' is missing.`,
			nameOf({ ktrhsReceiverConfig })
		);
	}

	const { ktrhId, start, duration, amountPerSec } = ktrhsReceiverConfig;

	if (isNullOrUndefined(ktrhId) || ktrhId < 0) {
		throw KtrhsErrors.ktrhsReceiverConfigError(
			`Ktrhs receiver config validation failed: '${nameOf({ ktrhId })}' must be greater than or equal to 0`,
			nameOf({ start }),
			start
		);
	}

	if (isNullOrUndefined(start) || start < 0) {
		throw KtrhsErrors.ktrhsReceiverConfigError(
			`Ktrhs receiver config validation failed: '${nameOf({ start })}' must be greater than or equal to 0`,
			nameOf({ start }),
			start
		);
	}

	if (isNullOrUndefined(duration) || duration < 0) {
		throw KtrhsErrors.ktrhsReceiverConfigError(
			`Ktrhs receiver config validation failed: '${nameOf({ duration })}' must be greater than or equal to 0`,
			nameOf({ duration }),
			duration
		);
	}

	if (isNullOrUndefined(amountPerSec) || amountPerSec <= 0) {
		throw KtrhsErrors.ktrhsReceiverConfigError(
			`Ktrhs receiver config validation failed: '${nameOf({ amountPerSec })}' must be greater than 0.`,
			nameOf({ amountPerSec }),
			amountPerSec
		);
	}
};

/** @internal */
export const validateKtrhsReceivers = (receivers: { userId: string; config: KtrhsReceiverConfig }[]) => {
	if (!receivers) {
		throw KtrhsErrors.argumentMissingError(
			`Ktrhs receivers validation failed: '${nameOf({ receivers })}' is missing.`,
			nameOf({ receivers })
		);
	}

	if (receivers.length > MAX_KTRHS_RECEIVERS) {
		throw KtrhsErrors.argumentError(
			`Ktrhs receivers validation failed: max number of ktrhs receivers exceeded. Max allowed ${MAX_KTRHS_RECEIVERS} but were ${receivers.length}.`,
			nameOf({ receivers }),
			receivers
		);
	}

	if (receivers.length) {
		receivers.forEach((receiver) => {
			const { userId, config } = receiver;

			if (isNullOrUndefined(userId)) {
				throw KtrhsErrors.ktrhsReceiverError(
					`Ktrhs receivers validation failed: '${nameOf({ userId })}' is missing.`,
					nameOf({ userId }),
					userId
				);
			}
			if (isNullOrUndefined(config)) {
				throw KtrhsErrors.ktrhsReceiverError(
					`Ktrhs receivers validation failed: '${nameOf({ config })}' is missing.`,
					nameOf({ config }),
					config
				);
			}

			validateKtrhsReceiverConfig(config);
		});
	}
};

/** @internal */
export const validateSplitsReceivers = (receivers: SplitsReceiverStruct[]) => {
	if (!receivers) {
		throw KtrhsErrors.argumentMissingError(
			`Splits receivers validation failed: '${nameOf({ receivers })}' is missing.`,
			nameOf({ receivers })
		);
	}

	if (receivers.length > MAX_SPLITS_RECEIVERS) {
		throw KtrhsErrors.argumentError(
			`Splits receivers validation failed: max number of ktrhs receivers exceeded. Max allowed ${MAX_SPLITS_RECEIVERS} but were ${receivers.length}.`,
			nameOf({ receivers }),
			receivers
		);
	}

	if (receivers.length) {
		receivers.forEach((receiver) => {
			const { userId, weight } = receiver;

			if (!userId) {
				throw KtrhsErrors.splitsReceiverError(
					`Splits receivers validation failed: '${nameOf({ userId })}' is missing.`,
					nameOf({ userId }),
					userId
				);
			}

			if (isNullOrUndefined(weight)) {
				throw KtrhsErrors.splitsReceiverError(
					`Splits receivers validation failed: '${nameOf({ weight })}' is missing.`,
					nameOf({ weight }),
					weight
				);
			}

			if (weight <= 0) {
				throw KtrhsErrors.splitsReceiverError(
					`Splits receiver config validation failed: : '${nameOf({ weight })}' must be greater than 0.`,
					nameOf({ weight }),
					weight
				);
			}
		});
	}
};

/** @internal */
export const validateClientProvider = async (provider: Provider, supportedChains: readonly number[]) => {
	if (!provider) {
		throw KtrhsErrors.initializationError(`The provider is missing.`);
	}

	const network = await provider.getNetwork();
	if (!supportedChains.includes(network?.chainId)) {
		throw KtrhsErrors.initializationError(
			`The provider is vezga to an unsupported network with chain ID '${network?.chainId}' ('${network?.name}'). Supported chain IDs are: ${supportedChains}.`
		);
	}
};

/** @internal */
export const validateClientSigner = async (signer: Signer, supportedChains: readonly number[]) => {
	if (!signer) {
		throw KtrhsErrors.initializationError(`The singer is missing.`);
	}

	const address = await signer.getAddress();
	if (!ethers.utils.isAddress(address)) {
		throw KtrhsErrors.initializationError(`Signer's address ('${address}') is not valid.`);
	}

	const { provider } = signer;
	if (!provider) {
		throw KtrhsErrors.initializationError(`The signer has no provider.`);
	}

	const network = await provider.getNetwork();
	if (!supportedChains.includes(network?.chainId)) {
		throw KtrhsErrors.initializationError(
			`The signer's provider is connected to an unsupported network with chain ID '${network?.chainId}' ('${network?.name}'). Supported chain IDs are: ${supportedChains}.`
		);
	}
};

/** @internal */
export const validateSetKtrhsInput = (
	tokenAddress: string,
	currentReceivers: {
		userId: string;
		config: KtrhsReceiverConfig;
	}[],
	newReceivers: {
		userId: string;
		config: KtrhsReceiverConfig;
	}[],
	transferToAddress: string,
	balanceDelta: BigNumberish
) => {
	validateAddress(tokenAddress);
	validateAddress(transferToAddress);
	validateKtrhsReceivers(newReceivers);
	validateKtrhsReceivers(currentReceivers);
	if (isNullOrUndefined(balanceDelta)) {
		throw KtrhsErrors.argumentMissingError(
			`Could not set ktrhs: '${nameOf({ balanceDelta })}' is missing.`,
			nameOf({ balanceDelta })
		);
	}
};

/** @internal */
export const validateEmitUserMetadataInput = (metadata: UserMetadata[]) => {
	if (!metadata) {
		throw KtrhsErrors.argumentError(`Invalid user metadata: '${nameOf({ metadata })}' is missing.`);
	}

	metadata.forEach((meta) => {
		const { key, value } = meta;

		if (!key) {
			throw KtrhsErrors.argumentError(`Invalid user metadata: '${nameOf({ key })}' is missing.`);
		}

		if (!value) {
			throw KtrhsErrors.argumentError(`Invalid user metadata: '${nameOf({ value })}' is missing.`);
		}
	});
};

/** @internal */
export const validateReceiveKtrhsInput = (userId: string, tokenAddress: string, maxCycles: BigNumberish) => {
	validateAddress(tokenAddress);

	if (isNullOrUndefined(userId)) {
		throw KtrhsErrors.argumentMissingError(
			`Could not receive ktrhs: '${nameOf({ userId })}' is missing.`,
			nameOf({ userId })
		);
	}

	if (!maxCycles || maxCycles < 0) {
		throw KtrhsErrors.argumentError(
			`Could not receive ktrhs: '${nameOf({ maxCycles })}' must be greater than 0.`,
			nameOf({ maxCycles }),
			maxCycles
		);
	}
};

/** @internal */
export const validateSplitInput = (
	userId: BigNumberish,
	tokenAddress: string,
	currentReceivers: SplitsReceiverStruct[]
) => {
	validateAddress(tokenAddress);
	validateSplitsReceivers(currentReceivers);

	if (isNullOrUndefined(userId)) {
		throw KtrhsErrors.argumentMissingError(`Could not split: '${nameOf({ userId })}' is missing.`, nameOf({ userId }));
	}
};

/** @internal */
export const validateCollectInput = (tokenAddress: string, transferToAddress: string) => {
	validateAddress(tokenAddress);
	validateAddress(transferToAddress);
};

/** @internal */
export const validateSqueezeKtrhsInput = (
	userId: string,
	tokenAddress: string,
	senderId: BigNumberish,
	historyHash: string,
	ktrhsHistory: KtrhsHistoryStruct[]
) => {
	validateAddress(tokenAddress);

	if (!userId) {
		throw KtrhsErrors.argumentError(`Invalid input for squeezing: '${nameOf({ userId })}' is missing.`);
	}

	if (!senderId) {
		throw KtrhsErrors.argumentError(`Invalid input for squeezing: '${nameOf({ senderId })}' is missing.`);
	}

	if (!historyHash) {
		throw KtrhsErrors.argumentError(`Invalid input for squeezing: '${nameOf({ historyHash })}' is missing.`);
	}

	if (!ktrhsHistory) {
		throw KtrhsErrors.argumentError(`Invalid input for squeezing: '${nameOf({ ktrhsHistory })}' is missing.`);
	}
};
