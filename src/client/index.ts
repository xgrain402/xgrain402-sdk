import { X402ClientConfig } from "../types";
import { getDefaultRpcUrl } from "../utils";
import { createPaymentFetch } from "./payment-interceptor";

/**
 * x402 Solana Client
 * Handles automatic payment for x402-protected endpoints
 */

export class X402Client {
  private paymentFetch: ReturnType<typeof createPaymentFetch>;

  constructor(config: X402ClientConfig) {
    const rpcUrl = config.rpcUrl || getDefaultRpcUrl(config.network);

    this.paymentFetch = createPaymentFetch(
      fetch.bind(window),
      config.wallet,
      rpcUrl,
      config.maxPaymentAmount || BigInt(0)
    );
  }

  /**
   * Make a fetch request with automatic x402 payment handling
   */
  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return this.paymentFetch(input, init);
  }
}

/**
 * Create an x402 client instance
 */
export function createX402Client(config: X402ClientConfig): X402Client {
  return new X402Client(config);
}

// Re-export types for convenience
export type { X402ClientConfig, WalletAdapter } from "../types";

