import { VersionedTransaction } from "@solana/web3.js";
import { SolanaNetwork } from "./x402-protocol";
import type { PaymentMiddlewareConfig, SPLTokenAmount, RouteConfig } from "x402/types";

/**
 * Solana-specific payment types
 */

// Re-export x402 types
export type { PaymentMiddlewareConfig, SPLTokenAmount, RouteConfig };

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

// Server configuration - aligns with x402 RouteConfig pattern
export interface X402ServerConfig {
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

