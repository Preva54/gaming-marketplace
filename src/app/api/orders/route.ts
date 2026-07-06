import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createEscrowTransaction, processBuyerPurchase, getWallet } from "@/lib/store"

const globalForOrders = globalThis as unknown as { _orders?: any[] }
const globalForProds = globalThis as unknown as { _products?: any[] }

function getOrders() {
  if (!globalForOrders._orders) globalForOrders._orders = []
  return globalForOrders._orders
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = (session.user as any).id
    const role = (session.user as any).role

    try {
      const where: Record<string, unknown> = {}
      if (role === "ADMIN") {
        if (status) where.status = status
      } else {
        if (role === "SELLER") {
          where.sellerId = userId
        } else {
          where.customerId = userId
        }
        if (status) where.status = status
      }
      const orders = await prisma.order.findMany({
        where,
        include: { product: { select: { id: true, name: true, price: true, images: true } }, customer: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(orders)
    } catch {
      let orders = getOrders()
      if (role !== "ADMIN") {
        if (role === "SELLER") {
          orders = orders.filter((o: any) => o.sellerId === userId)
        } else {
          orders = orders.filter((o: any) => o.customerId === userId)
        }
      }
      if (status) orders = orders.filter((o: any) => o.status === status)
      orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return NextResponse.json(orders)
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { productId, quantity, promoCode } = body
    const userId = (session.user as any).id
    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 })

    try {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      if (!product.availability || product.stock < (quantity || 1))
        return NextResponse.json({ error: "Product unavailable or out of stock" }, { status: 400 })

      const qty = quantity || 1
      let totalPrice = product.price * qty
      let discount = 0

      if (promoCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: promoCode } })
        if (coupon && coupon.active && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
          discount = coupon.type === "PERCENTAGE" ? totalPrice * (coupon.discount / 100) : coupon.discount
          totalPrice = Math.max(0, totalPrice - discount)
          await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
        }
      }

      const wallet = getWallet(userId)
      if (wallet.availableBalance < totalPrice) {
        return NextResponse.json({ error: "Insufficient wallet balance. Please add funds." }, { status: 400 })
      }

      const order = await prisma.order.create({
        data: { customerId: userId, productId, sellerId: product.sellerId, quantity: qty, totalPrice, promoCode: promoCode || null },
      })

      await prisma.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } })

      processBuyerPurchase(userId, totalPrice, order.id)
      createEscrowTransaction({ id: order.id, customerId: userId, sellerId: product.sellerId, totalPrice, category: product.category })

      await prisma.notification.create({
        data: { userId: product.sellerId, message: "New order for " + product.name, type: "ORDER" },
      })

      return NextResponse.json(order, { status: 201 })
    } catch {
      let products = globalForProds._products || []
      const product = products.find((p: any) => p.id === productId)
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
      if (!product.availability || product.stock < (quantity || 1))
        return NextResponse.json({ error: "Product unavailable or out of stock" }, { status: 400 })

      const qty = quantity || 1
      let totalPrice = product.price * qty

      const wallet = getWallet(userId)
      if (wallet.availableBalance < totalPrice) {
        return NextResponse.json({ error: "Insufficient wallet balance. Please add funds." }, { status: 400 })
      }

      const order = {
        id: "ord_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        customerId: userId, productId, sellerId: product.sellerId, quantity: qty, totalPrice,
        promoCode: promoCode || null, status: "PAYMENT_SECURED", paymentStatus: "COMPLETED", paymentMethod: "wallet",
        deliveryInfo: null, createdAt: new Date(), updatedAt: new Date(),
      }

      product.stock -= qty
      getOrders().push(order)
      processBuyerPurchase(userId, totalPrice, order.id)
      createEscrowTransaction({ id: order.id, customerId: userId, sellerId: product.sellerId, totalPrice, category: product.category })

      return NextResponse.json(order, { status: 201 })
    }
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
