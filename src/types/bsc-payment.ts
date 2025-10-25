import type { Transaction } from 'ethers';
import { BSCNetwork } from "./xgrain-protocol";
import type { PaymentMiddlewareConfig, SPLTokenAmount, RouteConfig } from "@xgrain402/core/types";

/**
 * BSC-specific payment types
 */

// Re-export xgrain402 types
export type { PaymentMiddlewareConfig, SPLTokenAmount, RouteConfig };

// Wallet adapter interface - framework agnostic
// Compatible with wagmi and ethers wallet implementations
export interface WalletAdapter {
  address?: string; // Wallet address
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}

// Client configuration
export interface XGrainClientConfig {
  wallet: WalletAdapter;
  network: BSCNetwork;
  rpcUrl?: string;
  maxPaymentAmount?: bigint;
}

// Server configuration - aligns with xgrain402 RouteConfig pattern
export interface XGrainServerConfig {
  network: BSCNetwork;
  treasuryAddress: string; // Where payments are sent (payTo)
  facilitatorUrl: string;
  rpcUrl?: string;
  defaultToken?: SPLTokenAmount['asset']; // Default token to accept (defaults to BNB)
  middlewareConfig?: PaymentMiddlewareConfig; // Default middleware config
}

// Helper function to check if a network is BSC-based
export function isBSCNetwork(network: string): network is "bsc" | "bsc-testnet" {
  return network === "bsc" || network === "bsc-testnet";
}

