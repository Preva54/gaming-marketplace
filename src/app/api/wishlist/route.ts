import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: (session.user as any).id },
      include: {
        product: {
          include: { seller: { select: { id: true, name: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(wishlist)
  } catch {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { productId } = body

    if (!productId)
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: (session.user as any).id, productId } },
    })
    if (existing) return NextResponse.json({ error: "Already in wishlist" }, { status: 409 })

    const item = await prisma.wishlist.create({
      data: { userId: (session.user as any).id, productId },
      include: { product: true },
    })

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId)
      return NextResponse.json({ error: "productId query parameter required" }, { status: 400 })

    await prisma.wishlist.deleteMany({
      where: { userId: (session.user as any).id, productId },
    })

    return NextResponse.json({ message: "Removed from wishlist" })
  } catch {
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 })
  }
}
