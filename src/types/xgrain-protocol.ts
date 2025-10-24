import { z } from "zod";
import { ExactSvmPayloadSchema } from "@xgrain402/core/types";

/**
 * Solana-specific xgrain402 Protocol Types
 * These are Solana-only variants of xgrain402 protocol types
 */

// Solana-only network enum
export const SolanaNetworkSchema = z.enum([
  "solana-devnet",
  "solana"
]);

export type SolanaNetwork = z.infer<typeof SolanaNetworkSchema>;

// Solana-specific payment payload schema
export const SolanaPaymentPayloadSchema = z.object({
  xgrainVersion: z.literal(1),
  scheme: z.literal("exact"),
  network: SolanaNetworkSchema,
  payload: ExactSvmPayloadSchema, // Official SVM payload from x402
});

export type SolanaPaymentPayload = z.infer<typeof SolanaPaymentPayloadSchema>;

