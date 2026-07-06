import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, createDispute } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role
    let disputes = store.disputes
    if (role !== "ADMIN") {
      disputes = disputes.filter((d) => d.raisedBy === userId)
    }
    disputes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(disputes)
  } catch {
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { escrowId, reason, description, evidence } = await req.json()
    if (!escrowId || !reason) return NextResponse.json({ error: "Escrow ID and reason required" }, { status: 400 })
    const userId = (session.user as any).id
    const dispute = createDispute(escrowId, userId, reason, description || "", evidence || [])
    if (!dispute) return NextResponse.json({ error: "Escrow not found or not in held status" }, { status: 400 })
    return NextResponse.json(dispute, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 })
  }
}
