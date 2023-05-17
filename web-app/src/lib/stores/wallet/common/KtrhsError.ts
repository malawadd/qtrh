/* eslint-disable max-classes-per-file */

import type { ContractReceipt } from 'ethers';

export enum KtrhsErrorCode {
	MISSING_SIGNER = 'MISSING_SIGNER',
	INVALID_ADDRESS = 'INVALID_ADDRESS',
	INVALID_ARGUMENT = 'INVALID_ARGUMENT',
	MISSING_ARGUMENT = 'MISSING_ARGUMENT',
	TX_EVENT_NOT_FOUND = 'TX_EVENT_NOT_FOUND',
	UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
	SUBGRAPH_QUERY_ERROR = 'SUBGRAPH_QUERY_ERROR',
	INVALID_KTRHS_RECEIVER = 'INVALID_KTRHS_RECEIVER',
	INITIALIZATION_FAILURE = 'INITIALIZATION_FAILURE',
	INVALID_SPLITS_RECEIVER = 'INVALID_SPLITS_RECEIVER',
	INVALID_KTRHS_RECEIVER_CONFIG = 'INVALID_KTRHS_RECEIVER_CONFIG'
}

export class KtrhsError extends Error {
	public readonly context?: unknown;
	public readonly code: KtrhsErrorCode;

	constructor(code: KtrhsErrorCode, message: string, context?: unknown) {
		super(message);

		this.code = code;
		this.context = context;
	}
}

export class KtrhsErrors {
	static initializationError = (message: string) => new KtrhsError(KtrhsErrorCode.INITIALIZATION_FAILURE, message);

	static addressError = (message: string, address: string) =>
		new KtrhsError(KtrhsErrorCode.INVALID_ADDRESS, message, {
			invalidAddress: address
		});

	static txEventNotFound = (message: string, eventName: string, txReceipt: ContractReceipt) =>
		new KtrhsError(KtrhsErrorCode.TX_EVENT_NOT_FOUND, message, {
			eventName,
			txReceipt
		});

	static signerMissingError = (
		message: string = 'Tried to perform an operation that requires a signer but a signer was not found.'
	) => new KtrhsError(KtrhsErrorCode.MISSING_SIGNER, message);

	static argumentMissingError = (message: string, argName: string) =>
		new KtrhsError(KtrhsErrorCode.MISSING_ARGUMENT, message, {
			missingArgumentName: argName
		});

	static unsupportedNetworkError = (message: string, chainId: number) =>
		new KtrhsError(KtrhsErrorCode.UNSUPPORTED_NETWORK, message, {
			unsupportedChainId: chainId
		});

	static argumentError = (message: string, argName?: string, argValue?: unknown) =>
		new KtrhsError(
			KtrhsErrorCode.INVALID_ARGUMENT,
			message,
			argName
				? {
						invalidArgument: { name: argName, value: argValue }
				  }
				: undefined
		);

	static splitsReceiverError = (message: string, invalidPropertyName: string, invalidPropertyValue: unknown) =>
		new KtrhsError(KtrhsErrorCode.INVALID_SPLITS_RECEIVER, message, {
			invalidProperty: {
				name: invalidPropertyName,
				value: invalidPropertyValue
			}
		});

	static ktrhsReceiverError = (message: string, invalidPropertyName: string, invalidPropertyValue: unknown) =>
		new KtrhsError(KtrhsErrorCode.INVALID_KTRHS_RECEIVER, message, {
			invalidProperty: {
				name: invalidPropertyName,
				value: invalidPropertyValue
			}
		});

	static ktrhsReceiverConfigError = (message: string, invalidPropertyName: string, invalidPropertyValue: unknown) =>
		new KtrhsError(KtrhsErrorCode.INVALID_KTRHS_RECEIVER_CONFIG, message, {
			invalidProperty: {
				name: invalidPropertyName,
				value: invalidPropertyValue
			}
		});

	static subgraphQueryError = (message: string) => new KtrhsError(KtrhsErrorCode.SUBGRAPH_QUERY_ERROR, message);
}
