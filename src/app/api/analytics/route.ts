import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if ((session.user as any).role !== "ADMIN")
      return NextResponse.json({ error: "Admin only" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, recentUsers, categoryCounts, orderStatusCounts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: "COMPLETED" } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true, email: true } }, product: { select: { name: true } } } }),
      prisma.user.findMany({ take: 10, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.product.groupBy({ by: ["category"], _count: true }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
    ])

    const revenueOverTime = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: "COMPLETED" },
      select: { totalPrice: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })

    const revenueByDay: Record<string, number> = {}
    for (const r of revenueOverTime) {
      const day = r.createdAt.toISOString().split("T")[0]
      revenueByDay[day] = (revenueByDay[day] || 0) + r.totalPrice
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
      },
      recentOrders,
      recentUsers,
      categoryDistribution: categoryCounts,
      orderStatusDistribution: orderStatusCounts,
      revenueByDay,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
