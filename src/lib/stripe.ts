import Stripe from "stripe"

function createStripe(): Stripe {
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia" as any,
      })
    }
    throw new Error("STRIPE_SECRET_KEY not set")
  } catch {
    return new Proxy({} as Stripe, {
      get() {
        return () => Promise.reject(new Error("Stripe not configured"))
      },
    })
  }
}

export const stripe = createStripe()

export async function createPaymentIntent(amount: number, currency: string = "usd") {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    })
    return paymentIntent
  } catch {
    return null
  }
}

export async function createCheckoutSession(
  items: { name: string; price: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return session
  } catch {
    return null
  }
}
