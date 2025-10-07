/**
 * x402 Solana - Types Package
 * All TypeScript types and Zod schemas for the x402 protocol
 */

// ============================================
// Import Solana-specific types from x402
// ============================================
import {
    ExactSvmPayloadSchema,
    SupportedSVMNetworks as x402SupportedSVMNetworks,
    SvmNetworkToChainId as x402SvmNetworkToChainId,
    PaymentRequirementsSchema,
    x402ResponseSchema,
    VerifyResponseSchema,
    SettleResponseSchema,
    SupportedPaymentKindSchema,
    SupportedPaymentKindsResponseSchema,
    ErrorReasons as x402ErrorReasons,
} from "x402/types";

import type { z } from "zod";

// Re-export schemas
export {
    ExactSvmPayloadSchema,
    PaymentRequirementsSchema,
    x402ResponseSchema,
    VerifyResponseSchema,
    SettleResponseSchema,
    SupportedPaymentKindSchema,
    SupportedPaymentKindsResponseSchema,
};

// Re-export constants
export const SupportedSVMNetworks = x402SupportedSVMNetworks;
export const SvmNetworkToChainId = x402SvmNetworkToChainId;
export const ErrorReasons = x402ErrorReasons;

// Infer and export types from schemas
export type ExactSvmPayload = z.infer<typeof ExactSvmPayloadSchema>;
export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;
export type x402Response = z.infer<typeof x402ResponseSchema>;
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
export type SettleResponse = z.infer<typeof SettleResponseSchema>;
export type SupportedPaymentKind = z.infer<typeof SupportedPaymentKindSchema>;
export type SupportedPaymentKindsResponse = z.infer<typeof SupportedPaymentKindsResponseSchema>;

// ============================================
// Solana-only variants (local)
// ============================================
export * from "./x402-protocol";  // SolanaNetwork, SolanaPaymentPayload

// ============================================
// Custom Solana types
// ============================================
export * from "./solana-payment";  // WalletAdapter, configs, etc.

