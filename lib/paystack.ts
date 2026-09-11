import { getSiteUrl } from "@/lib/config";
import type {
  BillingPeriod,
  DeliveryFrequency,
  DeliveryLocation,
} from "@/lib/pricing";

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("Missing PAYSTACK_SECRET_KEY.");
  }
  return key;
}

export type PaystackInitializeInput = {
  email: string;
  amountNaira: number;
  reference?: string;
  metadata: {
    user_id: string;
    plan_id: string;
    billing_period: BillingPeriod;
    delivery_frequency: DeliveryFrequency;
    delivery_location: DeliveryLocation;
    delivery_address: string;
    custom_fields: {
      display_name: string;
      variable_name: string;
      value: string;
    }[];
  };
};

export async function initializePaystackTransaction(
  input: PaystackInitializeInput,
) {
  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountNaira * 100,
      currency: "NGN",
      callback_url: `${getSiteUrl()}/api/paystack/callback`,
      metadata: input.metadata,
      reference: input.reference,
    }),
  });

  const payload = (await response.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; reference: string; access_code: string };
  };

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message || "Unable to start Paystack payment.");
  }

  return payload.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      paid_at: string | null;
      customer: { email: string };
      metadata?: unknown;
    };
  };

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message || "Unable to verify Paystack payment.");
  }

  return payload.data;
}
