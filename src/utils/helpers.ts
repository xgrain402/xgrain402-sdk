import { Transaction } from 'ethers';
import { PaymentRequirements, BSCNetwork, SPLTokenAmount } from "../types";

/**
 * Helper utilities for xgrain402 payment processing on BSC
 */

/**
 * Create payment header from a signed transaction
 * Encodes transaction and payment details into base64 X-PAYMENT header
 */
export function createPaymentHeaderFromTransaction(
  transaction: Transaction,
  paymentRequirements: PaymentRequirements,
  xgrainVersion: number
): string {
  // Serialize the signed transaction
  const serializedTransaction = Buffer.from(transaction.serialized).toString("base64");

  // Create payment payload matching xgrain402 spec
  const paymentPayload = {
    xgrainVersion: xgrainVersion,
    scheme: paymentRequirements.scheme,
    network: paymentRequirements.network,
    payload: {
      transaction: serializedTransaction,
    },
  };

  // Encode payment payload as base64 for X-PAYMENT header
  const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");

  return paymentHeader;
}

/**
 * Get default RPC URL for a given BSC network
 * @param network - Must be 'bsc' or 'bsc-testnet'
 * @returns Default RPC URL for the network
 */
export function getDefaultRpcUrl(network: BSCNetwork): string {
  if (network === "bsc") {
    return "https://bsc-dataseed.binance.org";
  } else if (network === "bsc-testnet") {
    return "https://data-seed-prebsc-1-s1.binance.org:8545";
  }
  // TypeScript ensures network is one of the two options, so this is unreachable
  throw new Error(`Unexpected network: ${network}`);
}

/**
 * Get default token asset for a given BSC network
 * Defaults to native BNB, returns x402-compatible SPLTokenAmount['asset']
 */
export function getDefaultTokenAsset(network: BSCNetwork): SPLTokenAmount['asset'] {
  // Native BNB uses zero address
  return {
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  };
}

/**
 * Convert human-readable amount to token's smallest unit (wei for BNB/EVM tokens)
 * @param amount - Human-readable amount (e.g., 0.5 for 0.5 BNB)
 * @param decimals - Token decimals (e.g., 18 for BNB, 18 for most BEP-20)
 */
export function toAtomicUnits(amount: number, decimals: number): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

/**
 * Convert token's atomic units to human-readable amount
 * @param atomicUnits - Token amount in smallest units (wei)
 * @param decimals - Token decimals (e.g., 18 for BNB)
 */
export function fromAtomicUnits(atomicUnits: bigint | number, decimals: number): number {
  return Number(atomicUnits) / Math.pow(10, decimals);
}

/**
 * Convert BNB to wei (18 decimals)
 * @param bnbAmount - Amount in BNB
 * @returns Amount in wei as string
 */
export function bnbToWei(bnbAmount: number): string {
  return toAtomicUnits(bnbAmount, 18).toString();
}

/**
 * Convert wei to BNB
 * @param weiAmount - Amount in wei (can be string or bigint)
 * @returns Amount in BNB
 */
export function weiToBnb(weiAmount: string | bigint): number {
  return fromAtomicUnits(BigInt(weiAmount), 18);
}

// Legacy USDC-specific helpers (deprecated, use BNB equivalents instead)
/** @deprecated Use bnbToWei or toAtomicUnits instead */
export function usdToMicroUsdc(usdAmount: number): number {
  return Math.floor(usdAmount * 1_000_000);
}

/** @deprecated Use weiToBnb or fromAtomicUnits instead */
export function microUsdcToUsd(microUsdc: number): number {
  return microUsdc / 1_000_000;
}
