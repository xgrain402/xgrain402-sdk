# x402-bsc

A reusable, framework-agnostic implementation of the x402 payment protocol for BSC (Binance Smart Chain).

## Features

- ✅ **Client-side**: Automatic 402 payment handling with any wallet provider
- ✅ **Server-side**: Payment verification and settlement with facilitator
- ✅ **Framework agnostic**: Works with any wallet provider (MetaMask, Rabby, etc.)
- ✅ **HTTP framework agnostic**: Works with Next.js, Express, Fastify, etc.
- ✅ **TypeScript**: Full type safety with Zod validation
- ✅ **Ethers.js**: Built on ethers v6 for EVM compatibility

## Installation

This package is currently designed to be used within your project. To use it in another project, copy the `src/lib/x402-bsc` directory.

### Dependencies

```bash
npm install ethers zod wagmi viem
```

## Usage

### Client Side (React/Frontend)

```typescript
import { createX402Client } from '@/lib/x402-bsc/client';
import { useAccount } from 'wagmi';

function MyComponent() {
  const { address, signTransaction } = useAccount();

  // Create x402 client
  const client = createX402Client({
    wallet: { address, signTransaction },
    network: 'bsc-testnet',
    maxPaymentAmount: BigInt('10000000000000000'), // Optional: max 0.01 BNB
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
import { X402PaymentHandler } from '@/lib/x402-bsc/server';

const x402 = new X402PaymentHandler({
  network: 'bsc-testnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.xgrain402.xyz',
});

export async function POST(req: NextRequest) {
  // 1. Extract payment header
  const paymentHeader = x402.extractPayment(req.headers);
  
  if (!paymentHeader) {
    // Return 402 with payment requirements
    const response = await x402.create402Response({
      amount: '10000000000000000',  // 0.01 BNB in wei
      description: 'AI Chat Request',
      resource: `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
    });
    return NextResponse.json(response.body, { status: response.status });
  }

  // 2. Create payment requirements (store this for verify/settle)
  const paymentRequirements = await x402.createPaymentRequirements({
    amount: '10000000000000000',
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
import { X402PaymentHandler } from './lib/x402-bsc/server';

const app = express();
const x402 = new X402PaymentHandler({
  network: 'bsc-testnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.xgrain402.xyz',
});

app.post('/api/paid-endpoint', async (req, res) => {
  // Extract payment
  const paymentHeader = x402.extractPayment(req.headers);
  
  if (!paymentHeader) {
    const response = await x402.create402Response({
      amount: '10000000000000000',
      description: 'API Request',
    });
    return res.status(response.status).json(response.body);
  }

  // Create payment requirements
  const paymentRequirements = await x402.createPaymentRequirements({
    amount: '10000000000000000',
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
  network: 'bsc' | 'bsc-testnet';
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
  network: 'bsc' | 'bsc-testnet';
  treasuryAddress: string;            // Where payments are sent
  facilitatorUrl: string;             // Facilitator service URL
  rpcUrl?: string;                    // Optional custom RPC
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
# Network (optional, defaults to testnet)
NEXT_PUBLIC_NETWORK=bsc-testnet

# Treasury wallet address (where payments are sent)
TREASURY_WALLET_ADDRESS=your_treasury_address

# Optional: Custom RPC URLs
NEXT_PUBLIC_BSC_RPC_TESTNET=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_BSC_RPC_MAINNET=https://bsc-dataseed.binance.org

# Base URL for resource field
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Wallet Adapter Interface

The package works with any wallet that implements this interface:

```typescript
interface WalletAdapter {
  address: string;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}
```

This works with:
- MetaMask (via wagmi)
- Rabby Wallet
- Trust Wallet
- Binance Wallet
- Any EVM-compatible wallet with `signTransaction` method

## Payment Amounts

Payment amounts are in wei (18 decimals for BNB):
- 1 BNB = 1,000,000,000,000,000,000 wei
- 0.01 BNB = 10,000,000,000,000,000 wei
- 0.001 BNB = 1,000,000,000,000,000 wei

**Helper functions:**
```typescript
import { bnbToWei, weiToBnb } from '@/lib/x402-bsc/utils';

const wei = bnbToWei(0.01);    // "10000000000000000"
const bnb = weiToBnb(wei);      // 0.01
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
src/lib/x402-bsc/
├── client/                    # Client-side code
│   ├── transaction-builder.ts # BSC transaction construction
│   ├── payment-interceptor.ts # 402 payment fetch interceptor
│   └── index.ts              # Main client export
├── server/                    # Server-side code
│   ├── facilitator-client.ts # Facilitator API communication
│   ├── payment-handler.ts    # Payment verification & settlement
│   └── index.ts              # Main server export
├── types/                     # TypeScript types
│   ├── xgrain-protocol.ts    # x402 spec types (Zod schemas)
│   ├── bsc-payment.ts        # BSC-specific types
│   └── index.ts
├── utils/                     # Utilities
│   ├── helpers.ts            # Helper functions
│   └── index.ts
└── index.ts                   # Main package export
```

## Future Enhancements

- [ ] Support for BEP-20 token payments (USDT, BUSD, etc.)
- [ ] Add support for multiple payment tokens
- [ ] Publish as standalone npm package
- [ ] Add transaction retry logic
- [ ] Support for partial payments
- [ ] Multi-chain support (Ethereum, Polygon, etc.)

## License

MIT

## Credits

Built on top of:
- [x402 Protocol](https://github.com/xgrain402)
- [ethers.js](https://github.com/ethers-io/ethers.js)
- [BSC Documentation](https://docs.bnbchain.org)
