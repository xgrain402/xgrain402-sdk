# xgrain402

*Modern Solana payment infrastructure for decentralized applications*

xgrain402 delivers production-ready payment processing capabilities built specifically for the Solana ecosystem. This SDK enables developers to integrate sophisticated microtransaction functionality into web applications, supporting automated payment flows that scale with blockchain-native performance characteristics.

## Overview

The xgrain402 SDK provides comprehensive tooling for implementing payment-gated resources using Solana's high-throughput blockchain infrastructure. Applications can leverage automated transaction processing, multi-wallet compatibility, and enterprise-grade security features without complex blockchain integrations.

**Core Capabilities:**
- Automated payment interception and processing
- Multi-wallet adapter compatibility across major Solana wallets  
- Type-safe TypeScript implementation with comprehensive validation
- Framework-agnostic architecture supporting major web frameworks
- Production-optimized performance with sub-second transaction finality
- Comprehensive audit trails and compliance logging

## Setup

Add xgrain402 to your project using your preferred package manager:

```bash
npm install xgrain402
# or
yarn add xgrain402  
# or
pnpm add xgrain402
```

## Implementation Guide

### Client-Side Integration

Implement automatic payment handling in browser environments:

```typescript
import { createXGrainClient } from 'xgrain402/client';
import { useWallet } from '@solana/wallet-adapter-react';

export function usePaymentClient() {
  const { publicKey, signTransaction } = useWallet();

  const client = createXGrainClient({
    wallet: { 
      address: publicKey?.toString(), 
      signTransaction 
    },
    network: 'mainnet-beta',
    maxAmount: BigInt(50_000_000), // Safety limit: $50 USDC
  });

  const requestPaidResource = async (endpoint: string, options?: RequestInit) => {
    return await client.fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  };

  return { requestPaidResource };
}
```

### Server-Side Configuration

Configure payment verification and settlement on your backend:

```typescript
import { XGrainPaymentProcessor } from 'xgrain402/server';
import { Request, Response } from 'express';

const processor = new XGrainPaymentProcessor({
  network: 'mainnet-beta',
  treasuryWallet: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorEndpoint: 'https://api.xgrain402.xyz/facilitator',
});

export async function handlePaymentGatedEndpoint(req: Request, res: Response) {
  const incomingPayment = processor.extractPayment(req.headers);
  
  const paymentSpec = await processor.createPaymentRequirements({
    price: {
      amount: "10000000", // $10.00 USDC
      asset: {
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // USDC Mainnet
      }
    },
    network: 'mainnet-beta',
    config: {
      description: 'API Access Fee',
      resource: req.url,
    }
  });
  
  if (!incomingPayment) {
    const paymentRequest = processor.createPaymentRequest(paymentSpec);
    return res.status(402).json(paymentRequest);
  }

  const verified = await processor.verifyPayment(incomingPayment, paymentSpec);
  if (!verified) {
    return res.status(402).json({ error: 'Invalid payment' });
  }

  // Execute protected business logic
  const result = await processProtectedOperation(req.body);
  
  // Complete payment settlement
  await processor.settlePayment(incomingPayment, paymentSpec);
  
  res.json({ data: result });
}
```

## Project Structure

```
xgrain402/
├── client/
│   ├── payment-interceptor.ts    # Automatic payment detection
│   ├── transaction-builder.ts    # Transaction assembly
│   └── wallet-adapter.ts        # Wallet interface abstraction
├── server/  
│   ├── payment-processor.ts     # Payment validation engine
│   ├── facilitator-client.ts    # Network communication layer
│   └── middleware.ts           # Framework integration utilities  
├── types/
│   ├── payment-protocol.ts     # Protocol schema definitions
│   ├── solana-primitives.ts    # Blockchain-specific types
│   └── client-server.ts       # API interface contracts
└── utils/
    ├── crypto.ts              # Cryptographic operations
    ├── validation.ts          # Input sanitization
    └── conversion.ts          # Currency formatting
```

## Configuration Reference

### Runtime Environment

Configure your application environment with the required variables:

```bash
# Solana Network Settings
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Payment Processing
TREASURY_WALLET_ADDRESS=your_treasury_solana_address
FACILITATOR_ENDPOINT=https://api.xgrain402.xyz/facilitator

# Application Config  
NEXT_PUBLIC_BASE_URL=https://your-application.com
XGRAIN_MAX_PAYMENT_AMOUNT=100000000
```

### Token Specifications

Configure supported SPL tokens for your payment flows:

```typescript
// Production USDC Configuration
const USDC_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Development USDC Configuration  
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const paymentConfiguration = {
  price: {
    amount: usdToMicroUsdc(24.99), // $24.99
    asset: { address: USDC_MAINNET }
  },
  network: 'mainnet-beta'
};
```

### Amount Handling

Payment amounts utilize USDC micro-units (6 decimal precision) represented as strings:

```typescript
import { usdToMicroUsdc, microUsdcToUsd } from 'xgrain402/utils';

// USD to micro-USDC conversion
const subscriptionPrice = usdToMicroUsdc(29.99);  // "29990000"  
const microPayment = usdToMicroUsdc(0.10);        // "100000"

// micro-USDC to USD conversion
const displayAmount = microUsdcToUsd("29990000"); // 29.99
```

## Security Implementation

**Cryptographic Security:**
- End-to-end encryption for all payment communications
- Non-custodial architecture - applications never control user funds  
- Complete audit logging for regulatory compliance requirements
- Built-in rate limiting and abuse prevention mechanisms
- Cryptographic signature verification for payment authenticity

## Wallet Compatibility Matrix

| Provider | Integration Level | Special Features |
|----------|------------------|------------------|
| Phantom | Complete | Mobile support, auto-approval |
| Solflare | Complete | Hardware wallet integration |
| Backpack | Complete | xNFT ecosystem integration |
| Glow | Complete | Native staking integration |  
| Slope | Standard | Basic transaction signing |
| Coin98 | Standard | Multi-blockchain support |

## Quality Assurance

### Test Suite Execution

```bash
npm run test              # Complete unit test coverage
npm run test:integration  # End-to-end integration testing  
npm run test:e2e          # Full payment flow validation
```

### Integration Verification

Access `/xgrain-test` within your application to validate:

- SDK integration correctness
- Wallet connection functionality  
- Complete payment flow execution
- Transaction signing capabilities
- Settlement process verification

## Performance Characteristics

**Network Performance:**
- Transaction confirmation: < 400ms average
- Solana network throughput: 65,000+ transactions per second
- Transaction cost: ~$0.00025 per operation
- Network uptime: 99.9% availability guarantee
- Payment verification latency: Sub-100ms response times

## Advanced Configuration

### Custom Payment Processing

```typescript
const advancedClient = createXGrainClient({
  wallet,
  network: 'mainnet-beta',
  customRPC: 'https://custom-rpc-endpoint.com',
  retryPolicy: {
    attempts: 5,
    backoff: 'exponential'
  },
  middleware: [
    metricsMiddleware,
    validationMiddleware
  ]
});
```

### Batch Transaction Processing

```typescript
const batchOperations = await xgrain.processBatch([
  { endpoint: '/api/data-processing', amount: '2500000' },
  { endpoint: '/api/content-access', amount: '1500000' },
  { endpoint: '/api/computation-task', amount: '750000' }
]);
```

## Framework Integration

Compatible with modern web development stacks:

**Frontend Frameworks:** Next.js, React, Vue.js, Svelte
**Backend Systems:** Express.js, Fastify, NestJS, Koa.js  
**Runtime Environments:** Node.js, Edge Runtime, Serverless
**Blockchain Integration:** Native Solana dApp compatibility

## Use Case Applications

Target applications for xgrain402 implementation:

**Automated Commerce:** IoT device micropayments for sensor data transmission
**AI Services:** Autonomous agent resource consumption and service billing
**Infrastructure Billing:** Granular pay-per-use API and compute resource pricing
**Media Distribution:** Per-consumption content access and streaming payments  
**Service Metering:** Usage-based billing models for SaaS applications

## Development Workflow

```bash
git clone https://github.com/xgrain402/xgrain402-sdk
cd xgrain402-sdk
pnpm install
pnpm build  
pnpm test
```

## License

MIT License

## Community Resources

**GitHub Issues:** [github.com/xgrain402/xgrain402-sdk/issues](https://github.com/xgrain402/xgrain402-sdk/issues)
**Twitter Updates:** [@xgrain402](https://twitter.com/xgrain402)

---

*xgrain402: Infrastructure for the decentralized economy*