import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { releaseEscrow, refundEscrow, store, addEarningsRecord, getSellerProfile } from "@/lib/store"

const globalForOrders = globalThis as unknown as { _orders?: any[] }
const globalForProds = globalThis as unknown as { _products?: any[] }

function getOrders() {
  if (!globalForOrders._orders) globalForOrders._orders = []
  return globalForOrders._orders
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PAYMENT_SECURED: ["AWAITING_SELLER_DELIVERY", "CANCELLED"],
  AWAITING_SELLER_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["BUYER_REVIEWING", "DISPUTED"],
  BUYER_REVIEWING: ["COMPLETED", "DISPUTED", "REFUND_REQUESTED"],
  COMPLETED: ["FUNDS_RELEASED"],
  FUNDS_RELEASED: [],
  CANCELLED: [],
  REFUND_REQUESTED: ["REFUNDED", "DISPUTED"],
  REFUNDED: [],
  DISPUTED: ["REFUNDED", "FUNDS_RELEASED"],
  PENDING: ["PAYMENT_SECURED", "CANCELLED"],
}

function isValidTransition(from: string, to: string): boolean {
  const allowed = STATUS_TRANSITIONS[from]
  if (!allowed) return false
  return allowed.includes(to)
}

function getProductName(productId: string): string {
  const products = globalForProds._products || []
  const product = products.find((p: any) => p.id === productId)
  return product?.name || "Unknown Product"
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const userId = (session.user as any).id
    const role = (session.user as any).role

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { product: true, customer: { select: { id: true, name: true, email: true, avatar: true } } },
      })
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
      if (order.customerId !== userId && order.sellerId !== userId && role !== "ADMIN")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      return NextResponse.json(order)
    } catch {
      const order = getOrders().find((o: any) => o.id === id)
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
      if (order.customerId !== userId && order.sellerId !== userId && role !== "ADMIN")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      const product = (globalForProds._products || []).find((p: any) => p.id === order.productId)
      return NextResponse.json({ ...order, product: product || null })
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const userId = (session.user as any).id
    const role = (session.user as any).role
    const body = await request.json()

    try {
      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

      if (role === "ADMIN") {
        const updateData: Record<string, unknown> = {}
        if (body.status) updateData.status = body.status
        if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus
        if (body.status === "DELIVERED") updateData.deliveredAt = new Date()
        if (body.status === "FUNDS_RELEASED" || body.status === "COMPLETED") {
          releaseEscrow("escrow_" + id)
          updateData.confirmedAt = new Date()
        }
        if (body.status === "REFUNDED") refundEscrow("escrow_" + id)
        const updated = await prisma.order.update({ where: { id }, data: updateData })
        return NextResponse.json(updated)
      }
      if (order.sellerId === userId) {
        const allowedTransitions: Record<string, string[]> = {
          PAYMENT_SECURED: ["AWAITING_SELLER_DELIVERY"],
          AWAITING_SELLER_DELIVERY: ["DELIVERED"],
          DELIVERED: [],
          BUYER_REVIEWING: [],
          COMPLETED: [],
        }
        const allowed = allowedTransitions[order.status] || []
        if (!body.status || !allowed.includes(body.status))
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
        const updateData: Record<string, unknown> = { status: body.status }
        if (body.deliveryInfo !== undefined) updateData.deliveryInfo = body.deliveryInfo
        if (body.status === "DELIVERED") updateData.deliveredAt = new Date()
        const updated = await prisma.order.update({ where: { id }, data: updateData })
        return NextResponse.json(updated)
      }
      if (order.customerId === userId) {
        const allowedTransitions: Record<string, string[]> = {
          PAYMENT_SECURED: ["CANCELLED", "REFUND_REQUESTED"],
          DELIVERED: ["BUYER_REVIEWING", "DISPUTED", "REFUND_REQUESTED"],
          BUYER_REVIEWING: ["COMPLETED", "DISPUTED", "REFUND_REQUESTED"],
        }
        const allowed = allowedTransitions[order.status] || []
        if (!body.status || !allowed.includes(body.status))
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
        const updateData: Record<string, unknown> = { status: body.status }
        if (body.status === "COMPLETED") {
          releaseEscrow("escrow_" + id)
          updateData.confirmedAt = new Date()
        }
        if (body.refundReason) updateData.refundReason = body.refundReason
        const updated = await prisma.order.update({ where: { id }, data: updateData })
        return NextResponse.json(updated)
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    } catch {
      const orders = getOrders()
      const idx = orders.findIndex((o: any) => o.id === id)
      if (idx === -1) return NextResponse.json({ error: "Order not found" }, { status: 404 })
      const order = orders[idx]

      if (role !== "ADMIN" && order.sellerId !== userId && order.customerId !== userId)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })

      if (role === "ADMIN") {
        if (body.status) orders[idx].status = body.status
        orders[idx].updatedAt = new Date()
        if (body.deliveryInfo !== undefined) orders[idx].deliveryInfo = body.deliveryInfo
        if (body.status === "FUNDS_RELEASED" || body.status === "COMPLETED") {
          releaseEscrow("escrow_" + id)
          orders[idx].confirmedAt = new Date()
        }
        if (body.status === "REFUNDED") {
          refundEscrow("escrow_" + id)
          orders[idx].confirmedAt = new Date()
        }
        return NextResponse.json(orders[idx])
      }

      if (order.sellerId === userId) {
        if (!body.status) return NextResponse.json({ error: "Status required" }, { status: 400 })
        const allowedTransitions: Record<string, string[]> = {
          PAYMENT_SECURED: ["AWAITING_SELLER_DELIVERY"],
          AWAITING_SELLER_DELIVERY: ["DELIVERED"],
        }
        const allowed = allowedTransitions[order.status] || []
        if (!allowed.includes(body.status))
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
        orders[idx].status = body.status
        orders[idx].updatedAt = new Date()
        if (body.deliveryInfo !== undefined) orders[idx].deliveryInfo = body.deliveryInfo
        if (body.status === "DELIVERED") orders[idx].deliveredAt = new Date()
        return NextResponse.json(orders[idx])
      }

      if (order.customerId === userId) {
        if (!body.status) return NextResponse.json({ error: "Status required" }, { status: 400 })
        const allowedTransitions: Record<string, string[]> = {
          PAYMENT_SECURED: ["CANCELLED", "REFUND_REQUESTED"],
          DELIVERED: ["BUYER_REVIEWING", "DISPUTED"],
          BUYER_REVIEWING: ["COMPLETED", "DISPUTED", "REFUND_REQUESTED"],
        }
        const allowed = allowedTransitions[order.status] || []
        if (!allowed.includes(body.status))
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
        orders[idx].status = body.status
        orders[idx].updatedAt = new Date()
        if (body.refundReason) orders[idx].refundReason = body.refundReason
        if (body.status === "COMPLETED") {
          const escrow = releaseEscrow("escrow_" + id)
          orders[idx].confirmedAt = new Date()
          if (escrow) {
            addEarningsRecord({
              orderId: id,
              sellerId: order.sellerId,
              productName: getProductName(order.productId),
              amount: escrow.amount,
              commission: escrow.commission,
              netAmount: escrow.sellerAmount,
            })
            const profile = getSellerProfile(order.sellerId)
            if (profile) {
              profile.totalSales += 1
              profile.totalEarnings = Math.round((profile.totalEarnings + escrow.sellerAmount) * 100) / 100
              profile.updatedAt = new Date()
            }
          }
        }
        if (body.status === "REFUND_REQUESTED") {
          orders[idx].refundReason = body.refundReason || "No reason provided"
        }
        if (body.status === "DISPUTED") {
          orders[idx].status = "DISPUTED"
          const escrow = store.escrowTransactions.find((e) => e.orderId === id)
          if (escrow) escrow.status = "DISPUTED"
        }
        return NextResponse.json(orders[idx])
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
