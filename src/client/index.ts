import { XGrainClientConfig } from "../types";
import { getDefaultRpcUrl } from "../utils";
import { createPaymentFetch } from "./payment-interceptor";

/**
 * xgrain402 Client
 * Handles automatic payment for xgrain402-protected endpoints
 */

export class XGrainClient {
  private paymentFetch: ReturnType<typeof createPaymentFetch>;

  constructor(config: XGrainClientConfig) {
    const rpcUrl = config.rpcUrl || getDefaultRpcUrl(config.network);

    this.paymentFetch = createPaymentFetch(
      fetch.bind(window),
      config.wallet,
      rpcUrl,
      config.maxPaymentAmount || BigInt(0)
    );
  }

  /**
   * Make a fetch request with automatic xgrain402 payment handling
   */
  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return this.paymentFetch(input, init);
  }
}

/**
 * Create an xgrain402 client instance
 */
export function createXGrainClient(config: XGrainClientConfig): XGrainClient {
  return new XGrainClient(config);
}

// Re-export types for convenience
export type { XGrainClientConfig, WalletAdapter } from "../types";

