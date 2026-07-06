import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, getWallet } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id

    try {
      const { prisma } = await import("@/lib/db")
      const dbWallet = await prisma.wallet.findUnique({ where: { userId } })
      if (dbWallet) {
        const dbTxs = await prisma.walletTransaction.findMany({
          where: { walletId: dbWallet.id },
          orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(dbTxs)
      }
    } catch {}

    const wallet = getWallet(userId)
    const transactions = store.walletTransactions
      .filter((t) => t.walletId === wallet.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(transactions)
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
