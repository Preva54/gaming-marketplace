import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { inMemoryUsers } from "@/lib/user-store"

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }

      const hashedPassword = await hash(password, 12)
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: role || "CUSTOMER" },
      })

      inMemoryUsers.push({
        id: user.id,
        name: user.name || "",
        email: user.email,
        password: hashedPassword,
        role: user.role as string,
        createdAt: new Date(),
      })

      return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
    } catch {
      const existing = inMemoryUsers.find((u) => u.email === email)
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }

      const hashedPassword = await hash(password, 12)
      const user = {
        id: `user_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: role || "CUSTOMER",
      }
      inMemoryUsers.push(user)

      return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
    }
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
