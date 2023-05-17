import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import {
  AddressDriverClient,
  AddressDriverTxFactory,
  CallerClient,
  KtrhsHubClient,
  KtrhsSubgraphClient,
  Utils,
  type NetworkConfig,
} from 'ktrh';
import { get } from 'svelte/store';
import isTest from './is-test';
import { env } from '$env/dynamic/public';

/**
 * Get an initialized Ktrhs Subgraph client.
 * @returns An initialized Ktrhs Subgraph client.
 */
export function getSubgraphClient() {
  const { network } = get(wallet);

  return KtrhsSubgraphClient.create(network.chainId, getNetworkConfig().SUBGRAPH_URL);
}

/**
 * Get an initialized Address Driver client.
 * @returns An initialized Address Driver client.
 */
export function getAddressDriverClient(withSigner = get(wallet).signer) {
  const { provider } = get(wallet);

  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;

  return AddressDriverClient.create(provider, withSigner, addressDriverAddress);
}

/**
 * Get an initialized Address Driver transaction factory.
 * @returns An initialized Address Driver transaction factory.
 */
export function getAddressDriverTxFactory() {
  const { signer } = get(wallet);
  assert(signer);

  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;

  return AddressDriverTxFactory.create(signer, addressDriverAddress);
}

/**
 * Get an initialized Ktrhs Hub client.
 * @returns An initialized Ktrhs Hub client.
 */
export function getKtrhsHubClient() {
  const { provider, signer } = get(wallet);

  const ktrhsHubAddress = getNetworkConfig().KTRHS_HUB;

  return KtrhsHubClient.create(provider, signer, ktrhsHubAddress);
}

/**
 * Get an initialized Caller client.
 * @returns An initialized Caller client.
 */
export function getCallerClient() {
  const { provider, signer, connected } = get(wallet);
  assert(connected, 'Wallet must be connected to create a CallerClient');

  return CallerClient.create(provider, signer, getNetworkConfig().CALLER);
}


export const networkConfigs: { [chainId: number]: NetworkConfig } = isTest()
  ? {
      3141: {
        CHAIN: 'Filecoin - Hyperspace testnet',
        DEPLOYMENT_TIME: 'foobar',
        COMMIT_HASH: '3809b5fa68c81af3fe0ac9200f8c806d7aa78c88',
        WALLET: '0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E',
        WALLET_NONCE: '1',
        DEPLOYER: '0xefbF81372aBC3723463746a89CEb42080563684C',
        KTRH_HUB_CYCLE_SECONDS: '604800',
        KTRH_HUB_ADMIN: '0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E',
        ADDRESS_DRIVER_ADMIN: '0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E',
        NFT_DRIVER_ADMIN: '0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E',
        IMMUTABLE_SPLITS_DRIVER_ADMIN: '0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E',
        SUBGRAPH_URL: `http://${
          env?.PUBLIC_TEST_SUBGRAPH_HOST ?? 'localhost'
        }:8000/subgraphs/name/KTRH-subgraph-local`,
        CALLER: '0x94e921D64cfEC517028D394B2136d31Cfa863293',
        KTRH_HUB: '0x62279E3aDD543FD456A2a4Db7a70a786Ba7107F6',
        NFT_DRIVER: '0x016d5ead895ffe01c6f05980b6348e1f3333a8f0',
        NFT_DRIVER_ID: '1',
        ADDRESS_DRIVER: '0xF359475404fa284601eD38Ac67f01C32a83373cC',
        KTRH_HUB_LOGIC: '0xbe131d793925c506ee49b100dccd7d103eeabae',
        ADDRESS_DRIVER_ID: '0',
        NFT_DRIVER_LOGIC: '',
        ADDRESS_DRIVER_LOGIC: '0xa2f5f6886fb0afb7b71dc9affe66dc02aef5eaad',
        IMMUTABLE_SPLITS_DRIVER: '',
        IMMUTABLE_SPLITS_DRIVER_ID: '2',
        IMMUTABLE_SPLITS_DRIVER_LOGIC: '',
      },
    }
  : {
      ...Utils.Network.configs,
    };

/**
 * Get the networkConfig for the current network.
 * @returns The networkConfig for the current network.
 */
export function getNetworkConfig() {
  const { network } = get(wallet);

  return networkConfigs[network.chainId];
}
