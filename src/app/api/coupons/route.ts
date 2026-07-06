import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (code) {
      const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
      if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
      if (!coupon.active) return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 })
      if (coupon.expiresAt && coupon.expiresAt < new Date())
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })

      return NextResponse.json({ valid: true, coupon })
    }

    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if ((session.user as any).role !== "ADMIN")
      return NextResponse.json({ error: "Admin only" }, { status: 403 })

    const body = await request.json()
    const { code, discount, type, maxUses, expiresAt } = body

    if (!code || !discount)
      return NextResponse.json({ error: "Code and discount required" }, { status: 400 })

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type: type || "PERCENTAGE",
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
