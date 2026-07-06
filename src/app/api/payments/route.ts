import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { amount, currency, orderId } = body

    if (!amount || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "usd",
      metadata: {
        userId: (session.user as any).id,
        ...(orderId && { orderId }),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch {
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
