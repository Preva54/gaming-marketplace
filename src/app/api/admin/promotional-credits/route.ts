import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addPromotionalCredits } from "@/lib/store"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { userId, amount, reason } = await req.json()
    if (!userId || !amount || amount <= 0 || !reason)
      return NextResponse.json({ error: "userId, amount, and reason required" }, { status: 400 })

    const wallet = addPromotionalCredits(userId, amount, reason)
    return NextResponse.json(wallet)
  } catch {
    return NextResponse.json({ error: "Failed to add promotional credits" }, { status: 500 })
  }
}
