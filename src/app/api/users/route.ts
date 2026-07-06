import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { inMemoryUsers } from "@/lib/user-store"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role

    const { searchParams } = new URL(request.url)
    const current = searchParams.get("current")

    if (current === "true") {
      const memUser = inMemoryUsers.find((u: any) => u.id === userId)
      if (memUser) {
        const { password, ...safeUser } = memUser as any
        return NextResponse.json(safeUser)
      }
      return NextResponse.json({ id: userId, name: (session.user as any).name, email: (session.user as any).email, role })
    }

    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const search = searchParams.get("search") || ""
    const roleFilter = searchParams.get("role")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    try {
      const where: Record<string, unknown> = {}
      if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }]
      if (roleFilter) where.role = roleFilter

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where, skip, take: limit,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, role: true, wallet: true, verificationStatus: true, twoFactorEnabled: true, createdAt: true, suspended: true, suspensionReason: true },
        }),
        prisma.user.count({ where }),
      ])
      return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) })
    } catch {
      let users = inMemoryUsers.map((u: any) => ({
        id: u.id, name: u.name, email: u.email, role: u.role,
        wallet: 0, verificationStatus: u.verificationStatus || "UNVERIFIED",
        twoFactorEnabled: u.twoFactorEnabled || false,
        suspended: u.suspended || false, suspensionReason: u.suspensionReason || null,
        createdAt: u.createdAt || new Date(),
      }))
      if (search) users = users.filter((u: any) => (u.name || "").toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
      if (roleFilter) users = users.filter((u: any) => u.role === roleFilter)
      const total = users.length
      users = users.slice(skip, skip + limit)
      return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) })
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const { name, email, password, role: newRole } = body
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 })

    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      const user = await prisma.user.create({
        data: { name, email, password, role: newRole || "CUSTOMER" },
      })
      return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role }, { status: 201 })
    } catch {
      if (inMemoryUsers.find((u: any) => u.email === email))
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
