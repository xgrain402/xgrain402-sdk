import { PaymentRequirements, x402Response, WalletAdapter } from "../types";
import { createBSCPaymentHeader } from "./transaction-builder";

/**
 * Create a custom fetch function that automatically handles xgrain402 payments
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

    const xgrainVersion: number = rawResponse.xgrainVersion;
    const parsedPaymentRequirements: PaymentRequirements[] = rawResponse.accepts || [];

    // Select first suitable payment requirement for BSC
    const selectedRequirements = parsedPaymentRequirements.find(
      (req: PaymentRequirements) =>
        req.scheme === "exact" &&
        (req.network === "bsc-testnet" || req.network === "bsc")
    );

    if (!selectedRequirements) {
      console.error(
        "❌ No suitable BSC payment requirements found. Available networks:",
        parsedPaymentRequirements.map((req) => req.network)
      );
      throw new Error("No suitable BSC payment requirements found");
    }

    // Check amount against max value if specified
    if (maxValue > BigInt(0) && BigInt(selectedRequirements.maxAmountRequired) > maxValue) {
      throw new Error("Payment amount exceeds maximum allowed");
    }

    // Create payment header using BSC transaction builder
    const paymentHeader = await createBSCPaymentHeader(
      wallet,
      xgrainVersion,
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
