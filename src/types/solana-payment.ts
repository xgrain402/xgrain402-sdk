import { VersionedTransaction } from "@solana/web3.js";
import { SolanaNetwork } from "./x402-protocol";

/**
 * Solana-specific payment types
 */

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

// Server configuration
export interface X402ServerConfig {
  network: SolanaNetwork;
  treasuryAddress: string;
  facilitatorUrl: string;
  rpcUrl?: string;
  usdcMint?: string;
}

// Payment creation options
export interface CreatePaymentOptions {
  amount: number; // USDC micro-units
  description: string;
  resource: string; // Required: URL of the protected resource
  maxTimeoutSeconds?: number;
}

// Helper function to check if a network is Solana-based
export function isSolanaNetwork(network: string): network is "solana" | "solana-devnet" {
  return network === "solana" || network === "solana-devnet";
}

