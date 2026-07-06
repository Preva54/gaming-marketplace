import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const globalForProds = globalThis as unknown as { _products?: any[] }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const sort = searchParams.get("sort") || "newest"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")))
    const skip = (page - 1) * limit

    try {
      const where: Record<string, unknown> = { availability: true, isDraft: false }
      if (search) where.name = { contains: search, mode: "insensitive" }
      if (category) where.category = category
      const orderBy: Record<string, string> =
        sort === "price_asc" ? { price: "asc" } :
        sort === "price_desc" ? { price: "desc" } :
        { createdAt: "desc" }
      const [products, total] = await Promise.all([
        prisma.product.findMany({ where, orderBy, skip, take: limit, include: { seller: { select: { id: true, name: true, avatar: true } } } }),
        prisma.product.count({ where }),
      ])
      return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
    } catch {
      let products = globalForProds._products || []
      if (search) products = products.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))
      if (category) products = products.filter((p: any) => p.category === category)
      if (sort === "price_asc") products.sort((a: any, b: any) => a.price - b.price)
      else if (sort === "price_desc") products.sort((a: any, b: any) => b.price - a.price)
      else products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const total = products.length
      products = products.slice(skip, skip + limit)
      return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "SELLER" && role !== "ADMIN")
      return NextResponse.json({ error: "Only sellers can create products" }, { status: 403 })

    const body = await request.json()
    const { category, name, description, price, images, stock, deliveryMethod, deliveryTime } = body
    if (!name || !price || !category)
      return NextResponse.json({ error: "Missing required fields: name, price, category" }, { status: 400 })

    try {
      const product = await prisma.product.create({
        data: {
          category, name, description: description || "", price: parseFloat(price),
          images: images || [], stock: stock ? parseInt(stock) : 1,
          sellerId: (session.user as any).id,
        },
      })
      return NextResponse.json(product, { status: 201 })
    } catch {
      const p = {
        id: "prod_" + Date.now(),
        category, name, description: description || "", price: parseFloat(price),
        images: images || [], stock: stock ? parseInt(stock) : 1,
        sellerId: (session.user as any).id, seller: { id: (session.user as any).id, name: (session.user as any).name, avatar: null },
        availability: true, featured: false, deliveryMethod: deliveryMethod || "DIGITAL_DELIVERY",
        deliveryTime: deliveryTime || null, isDraft: false,
        createdAt: new Date(), updatedAt: new Date(),
      }
      if (!globalForProds._products) globalForProds._products = []
      globalForProds._products.push(p)
      return NextResponse.json(p, { status: 201 })
    }
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
