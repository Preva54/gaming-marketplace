import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCommissionConfigs, createCommissionConfig, updateCommissionConfig, store } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const configs = getCommissionConfigs()
    return NextResponse.json(configs)
  } catch {
    return NextResponse.json({ error: "Failed to fetch commission configs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    if (body.id) {
      const updated = updateCommissionConfig(body.id, body)
      if (!updated) return NextResponse.json({ error: "Config not found" }, { status: 404 })
      return NextResponse.json(updated)
    }

    const config = createCommissionConfig({
      type: body.type || "PERCENTAGE",
      rate: body.rate || 0.05,
      fixedFee: body.fixedFee || 0,
      category: body.category || null,
      minFee: body.minFee || null,
      maxFee: body.maxFee || null,
      active: body.active !== undefined ? body.active : true,
    })
    return NextResponse.json(config, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to save commission config" }, { status: 500 })
  }
}
