/**
 * x402 Solana - Types Package
 * All TypeScript types and Zod schemas for the x402 protocol
 */

// ============================================
// Import types and schemas from x402 package
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
} from "x402/types";

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
} from "x402/types";

// ============================================
// Solana-only variants (local)
// ============================================
export * from "./x402-protocol";  // SolanaNetwork, SolanaPaymentPayload

// ============================================
// Custom Solana types
// ============================================
export * from "./solana-payment";  // WalletAdapter, configs, etc.

