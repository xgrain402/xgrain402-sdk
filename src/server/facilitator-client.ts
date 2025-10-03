import {
  PaymentRequirements,
  FacilitatorVerifyResponse,
  FacilitatorSettleResponse,
  FacilitatorSupportedResponse,
} from "../types";

/**
 * Client for communicating with x402 facilitator service
 */
export class FacilitatorClient {
  constructor(private facilitatorUrl: string) {}

  /**
   * Get fee payer address from facilitator's /supported endpoint
   */
  async getFeePayer(network: string): Promise<string> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/supported`);
      if (!response.ok) {
        throw new Error(`Facilitator /supported returned ${response.status}`);
      }

      const supportedData: FacilitatorSupportedResponse = await response.json();

      // Look for network support and extract fee payer
      const networkSupport = supportedData.kinds?.find(
        (kind) => kind.network === network && kind.scheme === "exact"
      );

      if (networkSupport?.extra?.feePayer) {
        return networkSupport.extra.feePayer;
      }

      // Fallback to hardcoded fee payer
      return "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4";
    } catch (error) {
      console.error("Failed to fetch fee payer from facilitator:", error);
      // Fallback to hardcoded fee payer
      return "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4";
    }
  }

  /**
   * Verify payment with facilitator
   */
  async verifyPayment(
    paymentHeader: string,
    paymentRequirements: PaymentRequirements,
    x402Version: number
  ): Promise<boolean> {
    try {
      // Decode the base64 payment payload
      const paymentPayload = JSON.parse(
        Buffer.from(paymentHeader, "base64").toString("utf8")
      );

      const verifyPayload = {
        x402Version,
        paymentPayload,
        paymentRequirements,
      };

      const response = await fetch(`${this.facilitatorUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyPayload),
      });

      if (!response.ok) {
        return false;
      }

      const facilitatorResponse: FacilitatorVerifyResponse = await response.json();
      return facilitatorResponse.isValid === true;
    } catch (error) {
      console.error("Payment verification failed:", error);
      return false;
    }
  }

  /**
   * Settle payment with facilitator
   */
  async settlePayment(
    paymentHeader: string,
    paymentRequirements: PaymentRequirements,
    x402Version: number
  ): Promise<boolean> {
    try {
      // Decode the base64 payment payload
      const paymentPayload = JSON.parse(
        Buffer.from(paymentHeader, "base64").toString("utf8")
      );

      const settlePayload = {
        x402Version,
        paymentPayload,
        paymentRequirements,
      };

      const response = await fetch(`${this.facilitatorUrl}/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settlePayload),
      });

      if (!response.ok) {
        return false;
      }

      const facilitatorResponse: FacilitatorSettleResponse = await response.json();
      return facilitatorResponse.success === true;
    } catch (error) {
      console.error("Payment settlement failed:", error);
      return false;
    }
  }
}

