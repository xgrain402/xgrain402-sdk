import { X402ServerConfig, CreatePaymentOptions, PaymentRequirements } from "../types";
import { getDefaultRpcUrl, getDefaultUsdcMint } from "../utils";
import { FacilitatorClient } from "./facilitator-client";

/**
 * x402 Payment Handler for server-side payment processing
 * Framework agnostic - works with any Node.js HTTP framework
 */
export class X402PaymentHandler {
  private facilitatorClient: FacilitatorClient;
  private config: Required<X402ServerConfig>;

  constructor(config: X402ServerConfig) {
    this.config = {
      network: config.network,
      treasuryAddress: config.treasuryAddress,
      facilitatorUrl: config.facilitatorUrl,
      rpcUrl: config.rpcUrl || getDefaultRpcUrl(config.network),
      usdcMint: config.usdcMint || getDefaultUsdcMint(config.network),
    };

    this.facilitatorClient = new FacilitatorClient(config.facilitatorUrl);
  }

  /**
   * Extract payment header from request headers
   * Pass in headers object from any framework (Next.js, Express, etc.)
   */
  extractPayment(headers: Record<string, string | string[] | undefined> | Headers): string | null {
    // Handle Headers object (Next.js, Fetch API)
    if (headers instanceof Headers) {
      return headers.get("X-PAYMENT") || headers.get("x-payment");
    }
    
    // Handle plain object (Express, Fastify, etc.)
    const xPayment = headers["X-PAYMENT"] || headers["x-payment"];
    return Array.isArray(xPayment) ? xPayment[0] : xPayment || null;
  }

  /**
   * Create payment requirements object
   */
  async createPaymentRequirements(
    options: CreatePaymentOptions
  ): Promise<PaymentRequirements> {
    const feePayer = await this.facilitatorClient.getFeePayer(this.config.network);

    return {
      scheme: "exact",
      network: this.config.network,
      maxAmountRequired: options.amount.toString(),
      resource: options.resource,
      description: options.description,
      mimeType: "application/json",
      payTo: this.config.treasuryAddress,
      maxTimeoutSeconds: options.maxTimeoutSeconds || 300,
      asset: this.config.usdcMint,
      outputSchema: {},
      extra: {
        feePayer,
      },
    };
  }

  /**
   * Create a 402 Payment Required response body
   * Use this with your framework's response method
   */
  async create402Response(options: CreatePaymentOptions): Promise<{
    status: 402;
    body: {
      x402Version: number;
      accepts: PaymentRequirements[];
      error: string;
    };
  }> {
    const paymentRequirements = await this.createPaymentRequirements(options);

    return {
      status: 402,
      body: {
        x402Version: 1,
        accepts: [paymentRequirements],
        error: "Payment required",
      },
    };
  }

  /**
   * Verify payment with facilitator
   */
  async verifyPayment(
    paymentHeader: string,
    paymentRequirements: PaymentRequirements
  ): Promise<boolean> {
    return this.facilitatorClient.verifyPayment(paymentHeader, paymentRequirements, 1);
  }

  /**
   * Settle payment with facilitator
   */
  async settlePayment(
    paymentHeader: string,
    paymentRequirements: PaymentRequirements
  ): Promise<boolean> {
    return this.facilitatorClient.settlePayment(paymentHeader, paymentRequirements, 1);
  }
}

