import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const globalForProds = globalThis as unknown as { _products?: any[] }

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get("sellerId") || userId
    if (role !== "ADMIN" && sellerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    try {
      const products = await prisma.product.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" },
        include: { seller: { select: { id: true, name: true, avatar: true } } },
      })
      if (products.length === 0 && (globalForProds._products?.length || 0) > 0) {
        const memProds = (globalForProds._products || [])
          .filter((p: any) => p.sellerId === sellerId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return NextResponse.json(memProds)
      }
      return NextResponse.json(products)
    } catch {
      const products = (globalForProds._products || [])
        .filter((p: any) => p.sellerId === sellerId)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return NextResponse.json(products)
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch seller products" }, { status: 500 })
  }
}
