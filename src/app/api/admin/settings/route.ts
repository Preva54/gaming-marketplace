import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

let settings = {
  siteName: "Nexus Market",
  description: "The Ultimate Gaming Marketplace",
  supportEmail: "support@nexusmarket.com",
  currency: "USD",
  taxRate: "8.5",
  commissionRate: "5",
  minWithdrawal: "10",
  maxWithdrawal: "10000",
  maintenanceMode: false,
  newRegistrations: true,
  sellerVerification: true,
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    settings = { ...settings, ...body }
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
