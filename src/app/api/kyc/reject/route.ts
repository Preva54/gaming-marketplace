import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rejectKyc } from "@/lib/store"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { userId, reason } = await req.json()
    if (!userId || !reason) return NextResponse.json({ error: "User ID and reason required" }, { status: 400 })
    const adminId = (session.user as any).id
    const result = rejectKyc(userId, adminId, reason)
    if (!result) return NextResponse.json({ error: "KYC not in pending review" }, { status: 400 })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to reject KYC" }, { status: 500 })
  }
}
