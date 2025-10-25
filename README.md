# xgrain402

*Modern BSC (Binance Smart Chain) payment infrastructure for decentralized applications*

xgrain402 delivers production-ready payment processing capabilities built specifically for the BSC ecosystem. This SDK enables developers to integrate sophisticated microtransaction functionality into web applications, supporting automated payment flows that scale with blockchain-native performance characteristics.

## Overview

The xgrain402 SDK provides comprehensive tooling for implementing payment-gated resources using BSC's high-throughput blockchain infrastructure. Applications can leverage automated transaction processing, multi-wallet compatibility, and enterprise-grade security features without complex blockchain integrations.

**Core Capabilities:**
- Automated payment interception and processing
- Multi-wallet adapter compatibility across major BSC wallets (MetaMask, Rabby)
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
import { useAccount } from 'wagmi';

export function usePaymentClient() {
  const { address, signTransaction } = useAccount();

  const client = createXGrainClient({
    wallet: { 
      address: address, 
      signTransaction 
    },
    network: 'bsc-mainnet',
    maxAmount: BigInt(50_000_000_000_000_000_000n), // Safety limit: 50 BNB
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
  network: 'bsc-mainnet',
  treasuryWallet: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorEndpoint: 'https://api.xgrain402.xyz/facilitator',
});

export async function handlePaymentGatedEndpoint(req: Request, res: Response) {
  const incomingPayment = processor.extractPayment(req.headers);
  
  const paymentSpec = await processor.createPaymentRequirements({
    price: {
      amount: "10000000000000000", // 0.01 BNB
      asset: {
        address: "0x0000000000000000000000000000000000000000" // Native BNB
      }
    },
    network: 'bsc-mainnet',
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
│   ├── bsc-primitives.ts       # Blockchain-specific types
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
# BSC Network Settings
NEXT_PUBLIC_BSC_NETWORK=bsc-mainnet
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed.binance.org

# Payment Processing
TREASURY_WALLET_ADDRESS=your_treasury_bsc_address
FACILITATOR_ENDPOINT=https://api.xgrain402.xyz/facilitator

# Application Config  
NEXT_PUBLIC_BASE_URL=https://your-application.com
XGRAIN_MAX_PAYMENT_AMOUNT=50000000000000000000
```

### Token Specifications

Configure supported BEP-20 tokens for your payment flows:

```typescript
// Native BNB Configuration
const BNB_NATIVE = "0x0000000000000000000000000000000000000000";

// USDT on BSC  
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";

// BUSD on BSC
const BUSD_BSC = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

const paymentConfiguration = {
  price: {
    amount: "10000000000000000", // 0.01 BNB
    asset: { address: BNB_NATIVE }
  },
  network: 'bsc-mainnet'
};
```

### Amount Handling

Payment amounts utilize BNB wei units (18 decimal precision) represented as strings:

```typescript
import { bnbToWei, weiToBnb } from 'xgrain402/utils';

// BNB to wei conversion
const subscriptionPrice = bnbToWei(0.5);   // "500000000000000000"  
const microPayment = bnbToWei(0.001);      // "1000000000000000"

// wei to BNB conversion
const displayAmount = weiToBnb("500000000000000000"); // 0.5
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
| MetaMask | Complete | Mobile support, auto-approval |
| Rabby | Complete | Multi-chain support |
| Trust Wallet | Complete | Mobile-first experience |
| Binance Wallet | Complete | Native BSC integration |
| Coinbase Wallet | Standard | Basic transaction signing |
| WalletConnect | Standard | Multi-wallet support |

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
- Transaction confirmation: < 3 seconds average
- BSC network throughput: 100+ transactions per second
- Transaction cost: ~$0.10-0.30 per operation
- Network uptime: 99.9% availability guarantee
- Payment verification latency: Sub-100ms response times

## Advanced Configuration

### Custom Payment Processing

```typescript
const advancedClient = createXGrainClient({
  wallet,
  network: 'bsc-mainnet',
  customRPC: 'https://bsc-dataseed1.binance.org',
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
  { endpoint: '/api/data-processing', amount: '10000000000000000' },
  { endpoint: '/api/content-access', amount: '5000000000000000' },
  { endpoint: '/api/computation-task', amount: '2500000000000000' }
]);
```

## Framework Integration

Compatible with modern web development stacks:

**Frontend Frameworks:** Next.js, React, Vue.js, Svelte
**Backend Systems:** Express.js, Fastify, NestJS, Koa.js  
**Runtime Environments:** Node.js, Edge Runtime, Serverless
**Blockchain Integration:** Native BSC dApp compatibility

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
