# xgrain402

**The Next-Generation Solana Payment Infrastructure**

Revolutionize digital commerce with instant, trustless transactions on Solana's high-performance blockchain. xgrain402 provides the foundational SDK for building seamless microtransaction systems that scale from individual payments to entire machine economies.

## 🚀 Key Features

✅ **Instant Payment Processing**: Sub-second transaction finality on Solana  
✅ **Universal Wallet Support**: Compatible with Phantom, Solflare, Backpack, and more  
✅ **Framework Agnostic**: Integrates with Next.js, Express, Fastify, React, Vue  
✅ **Type-Safe Architecture**: Full TypeScript support with Zod validation  
✅ **Enterprise Ready**: Built for high-volume, production-grade applications  
✅ **Machine Economy Optimized**: Purpose-built for automated payment flows  

## 🏗️ Installation

```bash
npm install xgrain402
```

```bash
pnpm add xgrain402
```

```bash
yarn add xgrain402
```

## 💡 Quick Start

### Frontend Integration

```typescript
import { createXGrainClient } from 'xgrain402/client';
import { useWallet } from '@solana/wallet-adapter-react';

function PaymentComponent() {
  const { publicKey, signTransaction } = useWallet();

  const xgrain = createXGrainClient({
    wallet: { address: publicKey?.toString(), signTransaction },
    network: 'mainnet-beta',
    maxAmount: BigInt(50_000_000), // $50 USDC safety limit
  });

  const handlePaidRequest = async () => {
    // Automatic payment handling - no complex integration needed
    const response = await xgrain.fetch('/api/premium-content', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123' }),
    });
    
    return response.json();
  };

  return (
    <button onClick={handlePaidRequest}>
      Access Premium Content
    </button>
  );
}
```

### Backend Integration

```typescript
import express from 'express';
import { XGrainPaymentProcessor } from 'xgrain402/server';

const app = express();
const xgrain = new XGrainPaymentProcessor({
  network: 'mainnet-beta',
  treasuryWallet: process.env.TREASURY_WALLET!,
  facilitatorEndpoint: 'https://api.xgrain402.xyz/facilitator',
});

app.post('/api/premium-content', async (req, res) => {
  // Extract payment verification
  const payment = xgrain.extractPayment(req.headers);
  
  // Define payment requirements
  const requirements = await xgrain.createPaymentRequirements({
    price: {
      amount: "5000000", // $5.00 USDC
      asset: {
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // USDC
      }
    },
    network: 'mainnet-beta',
    config: {
      description: 'Premium Content Access',
      resource: `${process.env.BASE_URL}/api/premium-content`,
    }
  });
  
  if (!payment) {
    const paymentResponse = xgrain.createPaymentRequest(requirements);
    return res.status(402).json(paymentResponse);
  }

  // Verify payment authenticity
  const isValid = await xgrain.verifyPayment(payment, requirements);
  if (!isValid) {
    return res.status(402).json({ error: 'Payment verification failed' });
  }

  // Process business logic
  const premiumContent = await getPremiumContent(req.body.userId);
  
  // Finalize payment settlement
  await xgrain.settlePayment(payment, requirements);

  res.json({ content: premiumContent, status: 'success' });
});
```

## 🎯 Architecture

```
xgrain402/
├── client/                    # Browser & React Native
│   ├── payment-interceptor.ts # Automatic payment handling
│   ├── transaction-builder.ts # Solana transaction construction
│   └── wallet-adapter.ts     # Universal wallet interface
├── server/                    # Node.js & Edge Runtime
│   ├── payment-processor.ts  # Payment verification & settlement
│   ├── facilitator-client.ts # Facilitator network communication
│   └── middleware.ts         # Express/Next.js middleware
├── types/                     # TypeScript definitions
│   ├── payment-protocol.ts   # xgrain402 payment schemas
│   ├── solana-primitives.ts  # Solana-specific types
│   └── client-server.ts      # Request/response interfaces
└── utils/                     # Helper functions
    ├── crypto.ts             # Cryptographic utilities
    ├── validation.ts         # Input validation & sanitization
    └── conversion.ts         # Currency & format conversion
```

## ⚙️ Configuration

### Environment Variables

```bash
# Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Treasury & Settlement
TREASURY_WALLET_ADDRESS=your_treasury_solana_address
FACILITATOR_ENDPOINT=https://api.xgrain402.xyz/facilitator

# Application Settings
NEXT_PUBLIC_BASE_URL=https://your-app.com
XGRAIN_MAX_PAYMENT_AMOUNT=100000000
```

### Token Configuration

```typescript
// Mainnet USDC
const MAINNET_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Devnet USDC
const DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const config = {
  price: {
    amount: usdToMicroUsdc(9.99), // $9.99
    asset: { address: MAINNET_USDC }
  },
  network: 'mainnet-beta'
};
```

## 💰 Payment Amounts

All amounts use USDC micro-units (6 decimals) as strings:

```typescript
import { usdToMicroUsdc, microUsdcToUsd } from 'xgrain402/utils';

// Convert USD to micro-USDC
const price = usdToMicroUsdc(19.99);  // "19990000"
const small = usdToMicroUsdc(0.05);   // "50000"

// Convert back to USD
const usd = microUsdcToUsd("19990000"); // 19.99
```

## 🔒 Security & Compliance

- **End-to-End Encryption**: All payment data encrypted in transit
- **Non-Custodial**: Your application never holds user funds
- **Audit Trail**: Complete transaction logging for compliance
- **Rate Limiting**: Built-in protection against abuse
- **Signature Verification**: Cryptographic payment authenticity

## 🌐 Supported Wallets

| Wallet | Status | Features |
|--------|--------|----------|
| Phantom | ✅ Full | Auto-approve, Mobile |
| Solflare | ✅ Full | Hardware wallet support |
| Backpack | ✅ Full | xNFT integration |
| Glow | ✅ Full | Stake integration |
| Slope | ✅ Basic | Transaction signing |
| Coin98 | ✅ Basic | Multi-chain support |

## 🚦 Testing

### Development Testing

```bash
npm run test           # Unit tests
npm run test:integration # Integration tests
npm run test:e2e       # End-to-end payment flows
```

### Test Environment

Visit `/xgrain-test` in your application to verify:

✅ SDK integration works correctly  
✅ Wallet connections are functional  
✅ Payment flows complete successfully  
✅ Transaction signing operates properly  
✅ Settlement processes execute  

## 📊 Performance

- **Transaction Speed**: < 400ms average confirmation
- **Throughput**: 65,000+ TPS on Solana
- **Cost**: ~$0.00025 per transaction
- **Uptime**: 99.9% network availability
- **Latency**: Sub-100ms payment verification

## 🔧 Advanced Usage

### Custom Payment Flows

```typescript
const xgrain = createXGrainClient({
  wallet,
  network: 'mainnet-beta',
  customRPC: 'https://your-rpc-endpoint.com',
  retryPolicy: {
    attempts: 3,
    backoff: 'exponential'
  },
  middleware: [
    analyticsMiddleware,
    customValidationMiddleware
  ]
});
```

### Batch Payments

```typescript
const batchPayment = await xgrain.processBatch([
  { endpoint: '/api/service-a', amount: '1000000' },
  { endpoint: '/api/service-b', amount: '2000000' },
  { endpoint: '/api/service-c', amount: '500000' }
]);
```

## 🤝 Ecosystem Integration

Works seamlessly with:

- **Next.js** - Server-side rendering & API routes
- **React** - Client-side payment components
- **Express** - REST API payment endpoints
- **Fastify** - High-performance web services
- **NestJS** - Enterprise-grade applications
- **Solana dApps** - Native blockchain integration

## 📈 Scaling to Machine Economies

xgrain402 is designed for the future of automated commerce:

- **IoT Device Payments**: Sensors paying for data uploads
- **AI Agent Transactions**: Autonomous service consumption
- **Micro-Service Billing**: Pay-per-use infrastructure
- **Content Monetization**: Granular media consumption
- **API Metering**: Usage-based pricing models

## 🛠️ Development

```bash
git clone https://github.com/xgrain402/xgrain402-sdk
cd xgrain402-sdk
pnpm install
pnpm build
pnpm test
```

## 📄 License

MIT License - Build the future of payments

## 🌟 Support

- **Documentation**: [docs.xgrain402.xyz](https://docs.xgrain402.xyz)
- **GitHub Issues**: [github.com/xgrain402/xgrain402-sdk/issues](https://github.com/xgrain402/xgrain402-sdk/issues)
- **Discord**: [discord.gg/xgrain402](https://discord.gg/xgrain402)
- **Twitter**: [@xgrain402](https://twitter.com/xgrain402)

---

**Built for the machine economy. Designed for scale. Powered by Solana.**

*xgrain402 - Enabling the next generation of autonomous digital commerce.*