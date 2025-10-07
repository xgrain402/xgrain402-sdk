import { PaymentRequirements, x402Response, WalletAdapter } from "../types";
import { createSolanaPaymentHeader } from "./transaction-builder";

/**
 * Create a custom fetch function that automatically handles x402 payments
 */
export function createPaymentFetch(
  fetchFn: typeof fetch,
  wallet: WalletAdapter,
  rpcUrl: string,
  maxValue: bigint = BigInt(0)
) {
  return async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    // Make initial request
    const response = await fetchFn(input, init);

    // If not 402, return as-is
    if (response.status !== 402) {
      return response;
    }

    // Parse payment requirements from 402 response
    const rawResponse = await response.json() as x402Response;

    const x402Version: number = rawResponse.x402Version;
    const parsedPaymentRequirements: PaymentRequirements[] = rawResponse.accepts || [];

    // Select first suitable payment requirement for Solana
    const selectedRequirements = parsedPaymentRequirements.find(
      (req: PaymentRequirements) =>
        req.scheme === "exact" &&
        (req.network === "solana-devnet" || req.network === "solana")
    );

    if (!selectedRequirements) {
      console.error(
        "❌ No suitable Solana payment requirements found. Available networks:",
        parsedPaymentRequirements.map((req) => req.network)
      );
      throw new Error("No suitable Solana payment requirements found");
    }

    // Check amount against max value if specified
    if (maxValue > BigInt(0) && BigInt(selectedRequirements.maxAmountRequired) > maxValue) {
      throw new Error("Payment amount exceeds maximum allowed");
    }

    // Create payment header using Solana transaction builder
    const paymentHeader = await createSolanaPaymentHeader(
      wallet,
      x402Version,
      selectedRequirements,
      rpcUrl
    );

    // Retry with payment header
    const newInit = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        "X-PAYMENT": paymentHeader,
        "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
      },
    };

    return await fetchFn(input, newInit);
  };
}

