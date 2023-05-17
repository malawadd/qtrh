import type { PopulatedTransaction } from 'ethers';
import type { KtrhsHistoryStruct } from '../../contracts/KtrhsHub';

export {
	KtrhsReceiverStruct,
	SplitsReceiverStruct,
	KtrhsHistoryStruct,
	KtrhsHubInterface,
	UserMetadataStruct
} from '../../contracts/KtrhsHub';
export { NFTDriverInterface } from '../../contracts/NFTDriver';
export { CallStruct, CallerInterface } from '../../contracts/Caller';
export { AddressDriverInterface } from '../../contracts/AddressDriver';
export { ImmutableSplitsDriverInterface } from '../../contracts/ImmutableSplitsDriver';

export type KtrhsReceiverConfig = {
	/** An arbitrary number used to identify a ktrh. When setting a config, it must be greater than or equal to `0`. It's a part of the configuration but the protocol doesn't use it. */
	ktrhId: bigint;

	/** The UNIX timestamp (in seconds) when ktrhping should start. When setting a config, it must be greater than or equal to `0`. If set to `0`, the contract will use the timestamp when ktrhs are configured. */
	start: bigint;

	/** The duration (in seconds) of ktrhping. When setting a config, it must be greater than or equal to `0`. If set to `0`, the contract will ktrh until the balance runs out. */
	duration: bigint;

	/** The amount per second being ktrhped. When setting a config, it must be in the smallest unit (e.g., Wei), greater than `0` **and be multiplied by `10 ^ 9`** (`constants.AMT_PER_SEC_MULTIPLIER`). */
	amountPerSec: bigint;
};

export type NetworkConfig = {
	CHAIN: string;
	DEPLOYMENT_TIME: string;
	COMMIT_HASH: string;
	WALLET: string;
	WALLET_NONCE: string;
	DEPLOYER: string;
	KTRHS_HUB: string;
	KTRHS_HUB_CYCLE_SECONDS: string;
	KTRHS_HUB_LOGIC: string;
	KTRHS_HUB_ADMIN: string;
	CALLER: string;
	ADDRESS_DRIVER: string;
	ADDRESS_DRIVER_LOGIC: string;
	ADDRESS_DRIVER_ADMIN: string;
	ADDRESS_DRIVER_ID: string;
	NFT_DRIVER: string;
	NFT_DRIVER_LOGIC: string;
	NFT_DRIVER_ADMIN: string;
	NFT_DRIVER_ID: string;
	IMMUTABLE_SPLITS_DRIVER: string;
	IMMUTABLE_SPLITS_DRIVER_LOGIC: string;
	IMMUTABLE_SPLITS_DRIVER_ADMIN: string;
	IMMUTABLE_SPLITS_DRIVER_ID: string;
	SUBGRAPH_URL: string;
};

export type CycleInfo = {
	cycleDurationSecs: bigint;
	currentCycleSecs: bigint;
	currentCycleStartDate: Date;
	nextCycleStartDate: Date;
};

export type KtrhsReceiver = { userId: string; config: KtrhsReceiverConfig };

export type Preset = PopulatedTransaction[];

export type UserMetadata = {
	key: string;
	value: string;
};

export type SqueezeArgs = {
	userId: string;
	tokenAddress: string;
	senderId: string;
	historyHash: string;
	ktrhsHistory: KtrhsHistoryStruct[];
};
