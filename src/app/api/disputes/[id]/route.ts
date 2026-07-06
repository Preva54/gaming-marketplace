import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveDispute, closeDispute } from "@/lib/store"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const adminId = (session.user as any).id

    if (body.action === "resolve") {
      if (!body.outcome || !body.resolution) return NextResponse.json({ error: "Outcome and resolution required" }, { status: 400 })
      const result = resolveDispute(id, adminId, body.resolution, body.outcome)
      if (!result) return NextResponse.json({ error: "Dispute not found or not open" }, { status: 400 })
      return NextResponse.json(result)
    }
    if (body.action === "close") {
      const result = closeDispute(id, adminId)
      if (!result) return NextResponse.json({ error: "Dispute not found" }, { status: 400 })
      return NextResponse.json(result)
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Failed to update dispute" }, { status: 500 })
  }
}
