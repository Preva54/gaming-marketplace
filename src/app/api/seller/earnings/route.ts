import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getEarningsHistory } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role
    if (role !== "SELLER" && role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const earnings = getEarningsHistory(userId)
    return NextResponse.json(earnings)
  } catch {
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}
