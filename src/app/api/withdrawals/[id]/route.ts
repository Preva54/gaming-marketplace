import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, approveWithdrawal, processWithdrawal, rejectWithdrawal } from "@/lib/store"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    const body = await req.json()
    const adminId = (session.user as any).id

    if (body.action === "approve") {
      const result = approveWithdrawal(id, adminId)
      if (!result) return NextResponse.json({ error: "Withdrawal not found or cannot be approved" }, { status: 400 })
      return NextResponse.json(result)
    }
    if (body.action === "process") {
      const result = processWithdrawal(id, adminId)
      if (!result) return NextResponse.json({ error: "Withdrawal not found or cannot be processed" }, { status: 400 })
      return NextResponse.json(result)
    }
    if (body.action === "reject") {
      if (!body.reason) return NextResponse.json({ error: "Rejection reason required" }, { status: 400 })
      const result = rejectWithdrawal(id, adminId, body.reason)
      if (!result) return NextResponse.json({ error: "Withdrawal not found or cannot be rejected" }, { status: 400 })
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Failed to update withdrawal" }, { status: 500 })
  }
}
