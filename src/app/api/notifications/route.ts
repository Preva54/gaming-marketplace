import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const notifications = await prisma.notification.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: (session.user as any).id, read: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    if (body.id) {
      await prisma.notification.update({
        where: { id: body.id },
        data: { read: true },
      })
      return NextResponse.json({ message: "Notification marked as read" })
    }

    if (body.all === true) {
      await prisma.notification.updateMany({
        where: { userId: (session.user as any).id, read: false },
        data: { read: true },
      })
      return NextResponse.json({ message: "All notifications marked as read" })
    }

    const { userId, message, type } = body
    if (!userId || !message)
      return NextResponse.json({ error: "userId and message required" }, { status: 400 })

    const notification = await prisma.notification.create({
      data: { userId, message, type: type || "INFO" },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to process notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { userId, message, type } = body

    if (!userId || !message)
      return NextResponse.json({ error: "userId and message required" }, { status: 400 })

    const notification = await prisma.notification.create({
      data: { userId, message, type: type || "INFO" },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
