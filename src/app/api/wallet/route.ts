import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getWallet } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id

    try {
      const { prisma } = await import("@/lib/db")
      const dbWallet = await prisma.wallet.findUnique({ where: { userId } })
      if (dbWallet) return NextResponse.json(dbWallet)
    } catch {}

    const wallet = getWallet(userId)
    return NextResponse.json(wallet)
  } catch {
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
  }
}
