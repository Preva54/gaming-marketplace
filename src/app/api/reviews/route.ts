import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId)
      return NextResponse.json({ error: "productId query parameter required" }, { status: 400 })

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    })

    const ratingArray = reviews as { rating: number }[]
    const total = ratingArray.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0)
    const average = reviews.length ? total / reviews.length : 0

    return NextResponse.json({ reviews, average, count: reviews.length })
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { productId, rating, review } = body

    if (!productId || !rating || !review)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: (session.user as any).id, productId } },
    })
    if (existing) return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 })

    if (rating < 1 || rating > 5)
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })

    const newReview = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        review,
        userId: (session.user as any).id,
        productId,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    return NextResponse.json(newReview, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
