import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role
    let escrows = store.escrowTransactions
    if (role !== "ADMIN") {
      escrows = escrows.filter((e) => e.buyerId === userId || e.sellerId === userId)
    }
    escrows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(escrows)
  } catch {
    return NextResponse.json({ error: "Failed to fetch escrows" }, { status: 500 })
  }
}
