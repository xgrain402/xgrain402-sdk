import { VersionedTransaction } from "@solana/web3.js";
import { Network, PaymentRequirements } from "./x402-protocol";

/**
 * Solana-specific payment types
 */

// Wallet adapter interface - framework agnostic
export interface WalletAdapter {
  address: string;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

// Client configuration
export interface X402ClientConfig {
  wallet: WalletAdapter;
  network: Network;
  rpcUrl?: string;
  maxPaymentAmount?: bigint;
}

// Server configuration
export interface X402ServerConfig {
  network: Network;
  treasuryAddress: string;
  facilitatorUrl: string;
  rpcUrl?: string;
  usdcMint?: string;
}

// Payment creation options
export interface CreatePaymentOptions {
  amount: number; // USDC micro-units
  description: string;
  resource?: string;
  maxTimeoutSeconds?: number;
}

// Facilitator response types
export interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
}

export interface FacilitatorSettleResponse {
  success: boolean;
  errorReason?: string;
}

export interface FacilitatorSupportedResponse {
  kinds?: Array<{
    network?: string;
    scheme?: string;
    extra?: {
      feePayer?: string;
    };
  }>;
}

// Helper function to check if a network is Solana-based
export function isSolanaNetwork(network: string): network is "solana" | "solana-devnet" {
  return network === "solana" || network === "solana-devnet";
}

// Helper function to check if a network is EVM-based
export function isEVMNetwork(network: string): boolean {
  return !isSolanaNetwork(network);
}

