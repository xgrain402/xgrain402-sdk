import { z } from "zod";
import { ExactSvmPayloadSchema } from "@xgrain402/core/types";

/**
 * BSC-specific xgrain402 Protocol Types
 * These are BSC-only variants of xgrain402 protocol types
 */

// BSC-only network enum
export const BSCNetworkSchema = z.enum([
  "bsc-testnet",
  "bsc"
]);

export type BSCNetwork = z.infer<typeof BSCNetworkSchema>;

// BSC-specific payment payload schema
export const BSCPaymentPayloadSchema = z.object({
  xgrainVersion: z.literal(1),
  scheme: z.literal("exact"),
  network: BSCNetworkSchema,
  payload: ExactSvmPayloadSchema, // Using SVM-compatible payload structure
});

export type BSCPaymentPayload = z.infer<typeof BSCPaymentPayloadSchema>;
