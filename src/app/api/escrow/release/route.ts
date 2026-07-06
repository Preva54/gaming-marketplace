import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { releaseEscrow } from "@/lib/store"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { escrowId } = await req.json()
    if (!escrowId) return NextResponse.json({ error: "Escrow ID required" }, { status: 400 })
    const result = releaseEscrow(escrowId)
    if (!result) return NextResponse.json({ error: "Escrow not found or not in held status" }, { status: 400 })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to release escrow" }, { status: 500 })
  }
}
