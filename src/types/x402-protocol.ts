import { z } from "zod";

/**
 * x402 Protocol Types
 * Based on the x402 payment protocol specification
 */

// Extended network enum that includes Solana networks
export const NetworkSchema = z.enum([
  "base-sepolia",
  "base",
  "avalanche-fuji",
  "avalanche",
  "iotex",
  "sei",
  "sei-testnet",
  "solana-devnet",
  "solana"
]);

export type Network = z.infer<typeof NetworkSchema>;

// Payment requirements schema with Solana support
export const PaymentRequirementsSchema = z.object({
  scheme: z.literal("exact"),
  network: NetworkSchema,
  asset: z.string().optional(),
  maxAmountRequired: z.string(),
  payTo: z.string(),
  resource: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  maxTimeoutSeconds: z.number().optional(),
  extra: z.record(z.unknown()).optional(),
  outputSchema: z.record(z.unknown()).nullable().optional()
});

export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;

// 402 Payment Required response schema
export const Payment402ResponseSchema = z.object({
  x402Version: z.number(),
  accepts: z.array(PaymentRequirementsSchema),
  error: z.string().optional()
});

export type Payment402Response = z.infer<typeof Payment402ResponseSchema>;

// Payment payload schemas for different networks
export const EVMPaymentPayloadSchema = z.object({
  transaction: z.string() // hex-encoded transaction
});

export const SolanaPaymentPayloadSchema = z.object({
  transaction: z.string() // base64-encoded transaction
});

export const PaymentPayloadSchema = z.union([
  EVMPaymentPayloadSchema,
  SolanaPaymentPayloadSchema
]);

export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;

// Full payment header schema
export const PaymentHeaderSchema = z.object({
  x402Version: z.number(),
  scheme: z.literal("exact"),
  network: NetworkSchema,
  payload: PaymentPayloadSchema
});

export type PaymentHeader = z.infer<typeof PaymentHeaderSchema>;

