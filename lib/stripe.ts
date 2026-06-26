import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeClient;
}

export function getStripePublishableKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
  }

  return publishableKey;
}

// Plan configuration
export const STRIPE_PLANS = {
  starter: {
    price_id: process.env.STRIPE_STARTER_PRICE_ID || "",
    name: "Starter",
    description: "Up to 1,000 products",
    features: ["1,000 products", "5 users", "Locations", "Basic reports"],
  },
  pro: {
    price_id: process.env.STRIPE_PRO_PRICE_ID || "",
    name: "Professional",
    description: "Up to 10,000 products",
    features: ["10,000 products", "Unlimited users", "Advanced reports", "API access"],
  },
  enterprise: {
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    name: "Enterprise",
    description: "Unlimited products",
    features: ["Unlimited products", "Unlimited users", "Custom integrations", "Priority support"],
  },
} as const;

export async function createStripeCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripeClient();

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
) {
  const stripe = getStripeClient();

  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}
