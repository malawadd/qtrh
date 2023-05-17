/* eslint-disable @typescript-eslint/no-namespace */
import type { BigNumberish, BytesLike } from 'ethers';
import { BigNumber, ethers } from 'ethers';
import { KtrhsErrors } from './common/KtrhsError';
import type { NetworkConfig, CycleInfo, KtrhsReceiverConfig, UserMetadataStruct } from './common/types';
import { validateAddress, validateKtrhsReceiverConfig } from './common/validators';

namespace Utils {
	export namespace Metadata {
		/**
		 * Converts a `string` to a `BytesLike` representation.
		 *
		 * @param key - The `string` to be converted.
		 * @returns The converted `BytesLike` representation of the `string`.
		 */
		export const keyFromString = (key: string): BytesLike => ethers.utils.formatBytes32String(key);

		/**
		 * Converts a `string` to a hex-encoded `BytesLike` representation.
		 *
		 * @param value - The `string` to be converted.
		 * @returns The hex-encoded `BytesLike` representation of the `string`.
		 */
		export const valueFromString = (value: string): BytesLike => ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value));

		/**
		 * Creates an object containing the `BytesLike` representations of the provided key and value `string`s.
		 *
		 * @param key - The `string` to be converted to a `BytesLike` key.
		 * @param value - The `string` to be converted to a `BytesLike` value.
		 * @returns An object containing the `BytesLike` representations of the key and value `string`s.
		 */
		export const createFromStrings = (
			key: string,
			value: string
		): {
			key: BytesLike;
			value: BytesLike;
		} => ({
			key: keyFromString(key),
			value: valueFromString(value)
		});

		/**
		 * Parses the `UserMetadataStruct` and converts the key and value from `BytesLike` to `string` format.
		 *
		 * @param userMetadata - The `UserMetadataStruct` containing the key and value in `BytesLike` format.
		 * @returns An `object` containing the key and value as `string`s.
		 */
		export const convertMetadataBytesToString = (userMetadata: UserMetadataStruct): { key: string; value: string } => {
			if (!ethers.utils.isBytesLike(userMetadata?.key) || !ethers.utils.isBytesLike(userMetadata?.value)) {
				throw KtrhsErrors.argumentError(
					`Invalid key-value user metadata pair: key or value is not a valid BytesLike object.`
				);
			}

			return {
				key: ethers.utils.parseBytes32String(userMetadata.key),
				value: ethers.utils.toUtf8String(userMetadata.value)
			};
		};
	}

	// TODO: Update the Subgraph URL 
	export namespace Network {
		export const configs: Record<number, NetworkConfig> = {
			// hyperspace
			3141: {
				CHAIN: 'Hyperspace',
				DEPLOYMENT_TIME: '2023-05-14T11:30:31+00:00',
				COMMIT_HASH: "3809b5fa68c81af3fe0ac9200f8c806d7aa78c88",
    			WALLET: "0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E",
				WALLET_NONCE: '144',
				DEPLOYER: '0xb12604b91bab991702388fb944f033e5d7ffe224',
				KTRHS_HUB: '0x62279E3aDD543FD456A2a4Db7a70a786Ba7107F6',
				KTRHS_HUB_CYCLE_SECONDS: '604800',
				KTRHS_HUB_LOGIC: '0xbe131d793925c506ee49b100dccd7d103eeabae',
				KTRHS_HUB_ADMIN: '0x840c1b6ce85bbfebcfad737514c0097b078a7e7e',
				CALLER: '0x94e921D64cfEC517028D394B2136d31Cfa863293',
				ADDRESS_DRIVER: '0xF359475404fa284601eD38Ac67f01C32a83373cC',
				ADDRESS_DRIVER_LOGIC: '0xa2f5f6886fb0afb7b71dc9affe66dc02aef5eaad',
				ADDRESS_DRIVER_ADMIN: '0x840c1b6ce85bbfebcfad737514c0097b078a7e7e',
				ADDRESS_DRIVER_ID: '0',
				NFT_DRIVER: '0x016d5ead895ffe01c6f05980b6348e1f3333a8f0',
				NFT_DRIVER_LOGIC: '0x0000000000000000000000000000000000000000',
				NFT_DRIVER_ADMIN: '0x840c1b6ce85bbfebcfad737514c0097b078a7e7e',
				NFT_DRIVER_ID: '2',
				IMMUTABLE_SPLITS_DRIVER: '',
				IMMUTABLE_SPLITS_DRIVER_LOGIC: '',
				IMMUTABLE_SPLITS_DRIVER_ADMIN: '',
				IMMUTABLE_SPLITS_DRIVER_ID: '1',
				SUBGRAPH_URL: ''
			},

		};

		export const SUPPORTED_CHAINS: readonly number[] = Object.freeze(
			Object.keys(configs).map((chainId) => parseInt(chainId, 10))
		);

		export const isSupportedChain = (chainId: number) => {
			if (SUPPORTED_CHAINS.includes(chainId)) {
				return true;
			}

			return false;
		};
	}
	export namespace Cycle {
		const getUnixTime = (date: Date): number => date.getTime() / 1000;

		export const getInfo = (chainId: number): CycleInfo => {
			if (!Network.isSupportedChain(chainId)) {
				throw KtrhsErrors.unsupportedNetworkError(
					`Could not get cycle info: chain ID '${chainId}' is not supported. Supported chain IDs are: ${Network.SUPPORTED_CHAINS.toString()}.`,
					chainId
				);
			}

			const cycleDurationSecs = BigInt(Network.configs[chainId].KTRHS_HUB_CYCLE_SECONDS);

			const currentCycleSecs = BigInt(Math.floor(getUnixTime(new Date()))) % cycleDurationSecs;

			const currentCycleStartDate = new Date(new Date().getTime() - Number(currentCycleSecs) * 1000);

			const nextCycleStartDate = new Date(currentCycleStartDate.getTime() + Number(cycleDurationSecs * BigInt(1000)));

			return {
				cycleDurationSecs,
				currentCycleSecs,
				currentCycleStartDate,
				nextCycleStartDate
			};
		};
	}

	export namespace Asset {
		/**
		 * Returns the ERC20 token address for the given asset.
		 * @param  {BigNumberish} assetId The asset ID.
		 * @returns The ERC20 token address.
		 */
		export const getAddressFromId = (assetId: BigNumberish): string =>
			ethers.utils.getAddress(BigNumber.from(assetId).toHexString());

		/**
		 * Returns the asset ID for the given ERC20 token.
		 * @param  {string} tokenAddress The ERC20 token address.
		 * @returns The asset ID.
		 * @throws {@link KtrhsErrors.addressError} if the `tokenAddress` address is not valid.
		 */
		export const getIdFromAddress = (tokenAddress: string): bigint => {
			validateAddress(tokenAddress);

			return BigNumber.from(ethers.utils.getAddress(tokenAddress)).toBigInt();
		};
	}

	export namespace KtrhsReceiverConfiguration {
		/**
		 * Converts a ktrhs receiver configuration object to a `uint256`.
		 * @param  {KtrhsReceiverConfigDto} ktrhsReceiverConfig The ktrhs receiver configuration object.
		 * @returns The ktrhs receiver configuration as a `uint256`.
		 * @throws {@link KtrhsErrors.argumentMissingError} if the `ktrhsReceiverConfig` is missing.
		 * @throws {@link KtrhsErrors.ktrhsReceiverConfigError} if the `ktrhsReceiverConfig` is not valid.
		 */
		export const toUint256 = (ktrhsReceiverConfig: KtrhsReceiverConfig): bigint => {
			validateKtrhsReceiverConfig(ktrhsReceiverConfig);

			const { ktrhId, start, duration, amountPerSec } = ktrhsReceiverConfig;

			let config = BigNumber.from(ktrhId);
			config = config.shl(160);
			config = config.or(amountPerSec);
			config = config.shl(32);
			config = config.or(start);
			config = config.shl(32);
			config = config.or(duration);

			return config.toBigInt();
		};

		/**
		 * Converts a `uint256` that represent a ktrhs receiver configuration to an object.
		 * @param  {BigNumberish} ktrhsReceiverConfig The ktrhs receiver configuration as`uint256`.
		 * @returns The ktrhs receiver configuration object.
		 * @throws {@link KtrhsErrors.argumentMissingError} if the `ktrhsReceiverConfig` is missing.
		 * @throws {@link KtrhsErrors.argumentError} if the `ktrhsReceiverConfig` is not valid.
		 */
		export const fromUint256 = (ktrhsReceiverConfig: BigNumberish): KtrhsReceiverConfig => {
			const configAsBn = BigNumber.from(ktrhsReceiverConfig);

			const ktrhId = configAsBn.shr(160 + 32 + 32);
			const amountPerSec = configAsBn.shr(32 + 32).and(BigNumber.from(1).shl(160).sub(1));
			const start = configAsBn.shr(32).and(BigNumber.from(1).shl(32).sub(1));
			const duration = configAsBn.and(BigNumber.from(1).shl(32).sub(1));

			const config = {
				ktrhId: ktrhId.toBigInt(),
				amountPerSec: amountPerSec.toBigInt(),
				duration: duration.toBigInt(),
				start: start.toBigInt()
			};

			validateKtrhsReceiverConfig(config);

			return config;
		};
	}
}

export default Utils;
