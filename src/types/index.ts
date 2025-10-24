/**
 * xgrain402 - Types Package
 * All TypeScript types and Zod schemas for the xgrain402 protocol
 */

// ============================================
// Import types and schemas from xgrain402 core
// ============================================
export type {
    // Solana/SVM specific
    ExactSvmPayload,

    // Protocol types
    PaymentRequirements,
    x402Response,
    VerifyResponse,
    SettleResponse,
    SupportedPaymentKind,
    SupportedPaymentKindsResponse,

    // Error handling
    ErrorReasons,

    // Middleware & routing
    PaymentMiddlewareConfig,
    SPLTokenAmount,
    RouteConfig,
} from "@xgrain402/core/types";

export {
    // Schemas
    ExactSvmPayloadSchema,
    PaymentRequirementsSchema,
    x402ResponseSchema,
    VerifyResponseSchema,
    SettleResponseSchema,
    SupportedPaymentKindSchema,
    SupportedPaymentKindsResponseSchema,

    // Constants
    SupportedSVMNetworks,
    SvmNetworkToChainId,
} from "@xgrain402/core/types";

// ============================================
// Solana-only variants (local)
// ============================================
export * from "./xgrain-protocol";  // SolanaNetwork, SolanaPaymentPayload

// ============================================
// Custom Solana types
// ============================================
export * from "./solana-payment";  // WalletAdapter, configs, etc.

