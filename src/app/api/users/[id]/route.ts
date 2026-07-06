import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { inMemoryUsers } from "@/lib/user-store"
import { suspendSeller, unsuspendSeller } from "@/lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const userId = (session.user as any).id
    const role = (session.user as any).role

    if (id !== userId && role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true, name: true, email: true, role: true, wallet: true,
          avatar: true, verificationStatus: true, twoFactorEnabled: true,
          phone: true, suspended: true, suspensionReason: true,
          promotionalCredits: true, createdAt: true,
          _count: { select: { products: true, orders: true, reviews: true } },
        },
      })
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
      return NextResponse.json(user)
    } catch {
      const user = inMemoryUsers.find((u: any) => u.id === id)
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
      const { password, ...safeUser } = user as any
      return NextResponse.json(safeUser)
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
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

    if (id !== userId && role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name
    if (body.avatar !== undefined) data.avatar = body.avatar
    if (body.password) data.password = await hash(body.password, 12)
    if (role === "ADMIN" && body.role !== undefined) data.role = body.role
    if (role === "ADMIN" && body.verificationStatus !== undefined) data.verificationStatus = body.verificationStatus
    if (body.twoFactorEnabled !== undefined) data.twoFactorEnabled = body.twoFactorEnabled
    if (role === "ADMIN" && body.suspended !== undefined) data.suspended = body.suspended
    if (role === "ADMIN" && body.suspensionReason !== undefined) data.suspensionReason = body.suspensionReason

    try {
      const updated = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true, name: true, email: true, role: true, wallet: true,
          avatar: true, verificationStatus: true, twoFactorEnabled: true,
          suspended: true, suspensionReason: true,
        },
      })
      return NextResponse.json(updated)
    } catch {
      const memUser = inMemoryUsers.find((u: any) => u.id === id)
      if (!memUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

      if (body.suspended !== undefined) {
        if (body.suspended) suspendSeller(id, body.suspensionReason || "No reason")
        else unsuspendSeller(id)
      }
      Object.assign(memUser, data)
      const { password, ...safeUser } = memUser as any
      return NextResponse.json(safeUser)
    }
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
