import { VersionedTransaction } from "@solana/web3.js";
import { SolanaNetwork } from "./x402-protocol";

/**
 * Solana-specific payment types
 */

/**
 * x402 standard middleware config
 * Based on: https://github.com/coinbase/x402/blob/main/typescript/packages/x402/src/types/shared/middleware.ts
 */
export interface PaymentMiddlewareConfig {
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
  outputSchema?: object;
  errorMessages?: {
    paymentRequired?: string;
    invalidPayment?: string;
    verificationFailed?: string;
    settlementFailed?: string;
  };
}

// Wallet adapter interface - framework agnostic
// Compatible with both Anza wallet-adapter and custom implementations
export interface WalletAdapter {
  publicKey?: { toString(): string }; // Anza wallet-adapter standard
  address?: string; // Alternative property
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

// Client configuration
export interface X402ClientConfig {
  wallet: WalletAdapter;
  network: SolanaNetwork;
  rpcUrl?: string;
  maxPaymentAmount?: bigint;
}

// Server configuration - extends x402 standard
export interface X402ServerConfig {
  network: SolanaNetwork;
  treasuryAddress: string;
  facilitatorUrl: string;
  rpcUrl?: string;
  usdcMint?: string;
  // Optional: x402 standard middleware config for metadata
  middlewareConfig?: PaymentMiddlewareConfig;
}

// Payment creation options - aligns with x402 RouteConfig
export interface CreatePaymentOptions {
  amount: number; // USDC micro-units (will be converted to SPLTokenAmount)
  resource: string; // Required: URL of the protected resource
  // Optional: x402 standard middleware config
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
  outputSchema?: object;
}

// Helper function to check if a network is Solana-based
export function isSolanaNetwork(network: string): network is "solana" | "solana-devnet" {
  return network === "solana" || network === "solana-devnet";
}

