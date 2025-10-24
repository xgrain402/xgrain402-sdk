import {
  PaymentRequirements,
  VerifyResponse,
  SettleResponse,
  SupportedPaymentKindsResponse,
  SupportedPaymentKind,
} from "../types";

type SupportedPaymentKindType = SupportedPaymentKind;

/**
 * Client for communicating with xgrain402 facilitator service
 */
export class FacilitatorClient {
  constructor(private facilitatorUrl: string) { }

  /**
   * Get fee payer address from facilitator's /supported endpoint
   */
  async getFeePayer(network: string): Promise<string> {
    const response = await fetch(`${this.facilitatorUrl}/supported`);
    if (!response.ok) {
      throw new Error(`Facilitator /supported returned ${response.status}`);
    }

    const supportedData: SupportedPaymentKindsResponse = await response.json();

    // Look for network support and extract fee payer
    const networkSupport = supportedData.kinds?.find(
      (kind: SupportedPaymentKindType) => kind.network === network && kind.scheme === "exact"
    );

    if (!networkSupport?.extra?.feePayer) {
      throw new Error(
        `Facilitator does not support network "${network}" with scheme "exact" or feePayer not provided`
      );
    }

    return networkSupport.extra.feePayer;
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

      const facilitatorResponse: VerifyResponse = await response.json();
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

      const facilitatorResponse: SettleResponse = await response.json();
      return facilitatorResponse.success === true;
    } catch (error) {
      console.error("Payment settlement failed:", error);
      return false;
    }
  }
}

