import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const globalForProds = globalThis as unknown as { _products?: any[] }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
          reviews: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      })
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      return NextResponse.json(product)
    } catch {
      const products = globalForProds._products || []
      const product = products.find((p: any) => p.id === id)
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      return NextResponse.json(product)
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const userId = (session.user as any).id
    const role = (session.user as any).role

    try {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      if (product.sellerId !== userId && role !== "ADMIN")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })

      const body = await request.json()
      const data: Record<string, unknown> = {}
      if (body.name !== undefined) data.name = body.name
      if (body.description !== undefined) data.description = body.description
      if (body.price !== undefined) data.price = parseFloat(body.price)
      if (body.category !== undefined) data.category = body.category
      if (body.images !== undefined) data.images = body.images
      if (body.stock !== undefined) data.stock = parseInt(body.stock)
      if (body.availability !== undefined) data.availability = body.availability
      if (body.featured !== undefined && role === "ADMIN") data.featured = body.featured

      const updated = await prisma.product.update({ where: { id }, data })
      return NextResponse.json(updated)
    } catch {
      const products = globalForProds._products || []
      const idx = products.findIndex((p: any) => p.id === id)
      if (idx === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      if (products[idx].sellerId !== userId && role !== "ADMIN")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })

      const body = await request.json()
      if (body.name !== undefined) products[idx].name = body.name
      if (body.description !== undefined) products[idx].description = body.description
      if (body.price !== undefined) products[idx].price = parseFloat(body.price)
      if (body.category !== undefined) products[idx].category = body.category
      if (body.stock !== undefined) products[idx].stock = parseInt(body.stock)
      if (body.availability !== undefined) products[idx].availability = body.availability
      products[idx].updatedAt = new Date()

      return NextResponse.json(products[idx])
    }
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const userId = (session.user as any).id
    const role = (session.user as any).role

    try {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      if (product.sellerId !== userId && role !== "ADMIN")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      await prisma.product.delete({ where: { id } })
      return NextResponse.json({ message: "Product deleted" })
    } catch {
      const products = globalForProds._products || []
      const idx = products.findIndex((p: any) => p.id === id)
      if (idx === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      if (products[idx].sellerId !== userId && role !== "ADMIN")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      products.splice(idx, 1)
      return NextResponse.json({ message: "Product deleted" })
    }
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
