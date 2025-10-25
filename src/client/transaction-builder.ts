import { ethers, Transaction, parseEther, formatEther } from 'ethers';
import { PaymentRequirements, WalletAdapter } from "../types";
import { createPaymentHeaderFromTransaction } from "../utils";

/**
 * Build and sign a BSC transaction for x402 payment
 */
export async function createBSCPaymentHeader(
  wallet: WalletAdapter,
  x402Version: number,
  paymentRequirements: PaymentRequirements,
  rpcUrl: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Extract fee payer from payment requirements
  const feePayer = (paymentRequirements as { extra?: { feePayer?: string } })?.extra?.feePayer;
  if (typeof feePayer !== "string" || !feePayer) {
    throw new Error("Missing facilitator feePayer in payment requirements (extra.feePayer).");
  }

  // Get wallet address
  const walletAddress = wallet?.address;
  if (!walletAddress) {
    throw new Error("Missing connected BSC wallet address");
  }

  if (!paymentRequirements?.payTo) {
    throw new Error("Missing payTo in payment requirements");
  }
  const destination = paymentRequirements.payTo;

  // Check if this is a native BNB transfer or BEP-20 token
  const isNativeTransfer = !paymentRequirements.asset || 
    paymentRequirements.asset === "0x0000000000000000000000000000000000000000";

  // Get nonce and gas price
  const nonce = await provider.getTransactionCount(walletAddress);
  const feeData = await provider.getFeeData();

  let transaction: Transaction;

  if (isNativeTransfer) {
    // Native BNB transfer
    const amount = BigInt(paymentRequirements.maxAmountRequired);

    transaction = Transaction.from({
      to: destination,
      value: amount,
      nonce: nonce,
      gasLimit: 21000n, // Standard gas limit for ETH/BNB transfer
      gasPrice: feeData.gasPrice,
      chainId: (await provider.getNetwork()).chainId,
      from: walletAddress,
    });
  } else {
    // BEP-20 token transfer
    const tokenAddress = paymentRequirements.asset as string;
    
    // ERC20/BEP-20 transfer function signature
    const iface = new ethers.Interface([
      "function transfer(address to, uint256 amount) returns (bool)"
    ]);

    const amount = BigInt(paymentRequirements.maxAmountRequired);
    const data = iface.encodeFunctionData("transfer", [destination, amount]);

    transaction = Transaction.from({
      to: tokenAddress,
      data: data,
      value: 0n,
      nonce: nonce,
      gasLimit: 100000n, // Standard gas limit for token transfers
      gasPrice: feeData.gasPrice,
      chainId: (await provider.getNetwork()).chainId,
      from: walletAddress,
    });
  }

  // Sign with user's wallet
  if (typeof wallet?.signTransaction !== "function") {
    throw new Error("Connected wallet does not support signTransaction");
  }

  const userSignedTx = await wallet.signTransaction(transaction);

  return createPaymentHeaderFromTransaction(
    userSignedTx,
    paymentRequirements,
    x402Version
  );
}
