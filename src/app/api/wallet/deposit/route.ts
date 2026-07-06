import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getWallet, addFunds } from "@/lib/store"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { amount } = await req.json()
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    const userId = (session.user as any).id
    const ref = "deposit_" + Date.now()

    try {
      const { prisma } = await import("@/lib/db")
      const dbWallet = await prisma.wallet.findUnique({ where: { userId } })
      if (dbWallet) {
        const updated = await prisma.wallet.update({
          where: { userId },
          data: { availableBalance: { increment: amount } },
        })
        await prisma.walletTransaction.create({
          data: {
            walletId: dbWallet.id,
            type: "DEPOSIT",
            amount,
            fee: 0,
            netAmount: amount,
            reference: ref,
            description: "Deposit via wallet",
          },
        })
        return NextResponse.json(updated)
      }
    } catch {}

    const wallet = addFunds(userId, amount, ref)
    return NextResponse.json(wallet)
  } catch {
    return NextResponse.json({ error: "Failed to deposit funds" }, { status: 500 })
  }
}
