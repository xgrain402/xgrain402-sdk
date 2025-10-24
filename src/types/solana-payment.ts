import { VersionedTransaction } from "@solana/web3.js";
import { SolanaNetwork } from "./xgrain-protocol";
import type { PaymentMiddlewareConfig, SPLTokenAmount, RouteConfig } from "@xgrain402/core/types";

/**
 * Solana-specific payment types
 */

// Re-export xgrain402 types
export type { PaymentMiddlewareConfig, SPLTokenAmount, RouteConfig };

// Wallet adapter interface - framework agnostic
// Compatible with both Anza wallet-adapter and custom implementations
export interface WalletAdapter {
  publicKey?: { toString(): string }; // Anza wallet-adapter standard
  address?: string; // Alternative property
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

// Client configuration
export interface XGrainClientConfig {
  wallet: WalletAdapter;
  network: SolanaNetwork;
  rpcUrl?: string;
  maxPaymentAmount?: bigint;
}

// Server configuration - aligns with xgrain402 RouteConfig pattern
export interface XGrainServerConfig {
  network: SolanaNetwork;
  treasuryAddress: string; // Where payments are sent (payTo)
  facilitatorUrl: string;
  rpcUrl?: string;
  defaultToken?: SPLTokenAmount['asset']; // Default token to accept (defaults to USDC)
  middlewareConfig?: PaymentMiddlewareConfig; // Default middleware config
}

// Helper function to check if a network is Solana-based
export function isSolanaNetwork(network: string): network is "solana" | "solana-devnet" {
  return network === "solana" || network === "solana-devnet";
}

