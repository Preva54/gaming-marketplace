import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = (session.user as any).id

    const conversations = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const conversationMap = new Map<string, typeof conversations[0]>()
    for (const msg of conversations) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, msg)
      }
    }

    const result = Array.from(conversationMap.entries()).map(([otherId, lastMsg]) => {
      const other = lastMsg.senderId === userId ? lastMsg.receiver : lastMsg.sender
      return {
        userId: otherId,
        user: other,
        lastMessage: lastMsg.content,
        lastMessageAt: lastMsg.createdAt,
        unread: !lastMsg.read && lastMsg.receiverId === userId,
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { receiverId, content, attachments } = body

    if (!receiverId || !content)
      return NextResponse.json({ error: "receiverId and content required" }, { status: 400 })

    const message = await prisma.message.create({
      data: {
        senderId: (session.user as any).id,
        receiverId,
        content,
        attachments: attachments || [],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: receiverId,
        message: `New message from ${(session.user as any).name || "User"}`,
        type: "MESSAGE",
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
