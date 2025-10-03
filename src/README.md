# x402-solana

A reusable, framework-agnostic implementation of the x402 payment protocol for Solana.

## Features

- ✅ **Client-side**: Automatic 402 payment handling with any wallet provider
- ✅ **Server-side**: Payment verification and settlement with facilitator
- ✅ **Framework agnostic**: Works with any wallet provider (Privy, Phantom, etc.)
- ✅ **HTTP framework agnostic**: Works with Next.js, Express, Fastify, etc.
- ✅ **TypeScript**: Full type safety with Zod validation
- ✅ **Web3.js**: Built on @solana/web3.js and @solana/spl-token

## Installation

This package is currently designed to be used within your project. To use it in another project, copy the `src/lib/x402-solana` directory.

### Dependencies

```bash
npm install @solana/web3.js @solana/spl-token zod
```

## Usage

### Client Side (React/Frontend)

```typescript
import { createX402Client } from '@/lib/x402-solana/client';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

function MyComponent() {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];

  // Create x402 client
  const client = createX402Client({
    wallet,
    network: 'solana-devnet',
    maxPaymentAmount: BigInt(10_000_000), // Optional: max 10 USDC
  });

  // Make a paid request - automatically handles 402 payments
  const response = await client.fetch('/api/paid-endpoint', {
    method: 'POST',
    body: JSON.stringify({ data: 'your request' }),
  });

  const result = await response.json();
}
```

### Server Side (Next.js API Route)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from '@/lib/x402-solana/server';

const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network',
});

export async function POST(req: NextRequest) {
  // 1. Extract payment header
  const paymentHeader = x402.extractPayment(req.headers);
  
  if (!paymentHeader) {
    // Return 402 with payment requirements
    const response = await x402.create402Response({
      amount: 2_500_000,  // $2.50 USDC (in micro-units)
      description: 'AI Chat Request',
      resource: `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
    });
    return NextResponse.json(response.body, { status: response.status });
  }

  // 2. Create payment requirements (store this for verify/settle)
  const paymentRequirements = await x402.createPaymentRequirements({
    amount: 2_500_000,
    description: 'AI Chat Request',
    resource: `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
  });

  // 3. Verify payment
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
  }

  // 4. Process your business logic
  const result = await yourBusinessLogic(req);

  // 5. Settle payment
  await x402.settlePayment(paymentHeader, paymentRequirements);

  // 6. Return response
  return NextResponse.json(result);
}
```

### Server Side (Express)

```typescript
import express from 'express';
import { X402PaymentHandler } from './lib/x402-solana/server';

const app = express();
const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network',
});

app.post('/api/paid-endpoint', async (req, res) => {
  // Extract payment
  const paymentHeader = x402.extractPayment(req.headers);
  
  if (!paymentHeader) {
    const response = await x402.create402Response({
      amount: 2_500_000,
      description: 'API Request',
    });
    return res.status(response.status).json(response.body);
  }

  // Create payment requirements
  const paymentRequirements = await x402.createPaymentRequirements({
    amount: 2_500_000,
    description: 'API Request',
  });

  // Verify payment
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return res.status(402).json({ error: 'Invalid payment' });
  }

  // Your business logic here
  const result = await yourBusinessLogic(req);

  // Settle payment
  await x402.settlePayment(paymentHeader, paymentRequirements);

  res.json(result);
});
```

## API Reference

### Client

#### `createX402Client(config)`

Creates a new x402 client instance.

**Config:**
```typescript
{
  wallet: WalletAdapter;              // Wallet with signTransaction method
  network: 'solana' | 'solana-devnet';
  rpcUrl?: string;                    // Optional custom RPC
  maxPaymentAmount?: bigint;          // Optional safety limit
}
```

**Methods:**
- `client.fetch(input, init)` - Make a fetch request with automatic payment handling

### Server

#### `new X402PaymentHandler(config)`

Creates a new payment handler instance.

**Config:**
```typescript
{
  network: 'solana' | 'solana-devnet';
  treasuryAddress: string;            // Where payments are sent
  facilitatorUrl: string;             // Facilitator service URL
  rpcUrl?: string;                    // Optional custom RPC
  usdcMint?: string;                  // Auto-detected if not provided
}
```

**Methods:**
- `extractPayment(headers)` - Extract X-PAYMENT header from request
- `createPaymentRequirements(options)` - Create payment requirements object
- `create402Response(options)` - Create 402 response body
- `verifyPayment(header, requirements)` - Verify payment with facilitator
- `settlePayment(header, requirements)` - Settle payment with facilitator

## Configuration

### Environment Variables

```bash
# Network (optional, defaults to devnet)
NEXT_PUBLIC_NETWORK=solana-devnet

# Treasury wallet address (where payments are sent)
TREASURY_WALLET_ADDRESS=your_treasury_address

# Optional: Custom RPC URLs
NEXT_PUBLIC_SOLANA_RPC_DEVNET=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://api.mainnet-beta.solana.com

# Base URL for resource field
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Wallet Adapter Interface

The package works with any wallet that implements this interface:

```typescript
interface WalletAdapter {
  address: string;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}
```

This works with:
- Privy wallets (`useSolanaWallets()`)
- Phantom SDK
- Solflare SDK
- Any wallet with `signTransaction` method

## Payment Amounts

Payment amounts are in USDC micro-units (6 decimals):
- 1 USDC = 1,000,000 micro-units
- $0.01 = 10,000 micro-units
- $2.50 = 2,500,000 micro-units

**Helper functions:**
```typescript
import { usdToMicroUsdc, microUsdcToUsd } from '@/lib/x402-solana/utils';

const microUnits = usdToMicroUsdc(2.5);  // 2_500_000
const usd = microUsdcToUsd(2_500_000);   // 2.5
```

## Testing

Visit `/x402-test` in your app to test the package independently.

The test verifies:
- ✅ Package imports work correctly
- ✅ Client can be created with wallet adapter
- ✅ Automatic 402 payment handling works
- ✅ Transaction signing and submission succeed
- ✅ Payment verification and settlement complete

## Architecture

```
src/lib/x402-solana/
├── client/                    # Client-side code
│   ├── transaction-builder.ts # Solana transaction construction
│   ├── payment-interceptor.ts # 402 payment fetch interceptor
│   └── index.ts              # Main client export
├── server/                    # Server-side code
│   ├── facilitator-client.ts # Facilitator API communication
│   ├── payment-handler.ts    # Payment verification & settlement
│   └── index.ts              # Main server export
├── types/                     # TypeScript types
│   ├── x402-protocol.ts      # x402 spec types (Zod schemas)
│   ├── solana-payment.ts     # Solana-specific types
│   └── index.ts
├── utils/                     # Utilities
│   ├── helpers.ts            # Helper functions
│   └── index.ts
└── index.ts                   # Main package export
```

## Future Enhancements

- [ ] Add @solana/kit adapter for AI agents
- [ ] Support for multiple payment tokens
- [ ] Publish as standalone npm package
- [ ] Add transaction retry logic
- [ ] Support for partial payments

## License

MIT

## Credits

Built on top of:
- [x402 Protocol](https://github.com/payainetwork/x402)
- [@solana/web3.js](https://github.com/solana-labs/solana-web3.js)
- [PayAI Network](https://payai.network)

