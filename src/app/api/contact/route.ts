import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { subject, message, category, priority } = body

    if (!subject || !message)
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 })

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.user ? (session.user as any).id : "anonymous",
        subject,
        message,
        priority: priority || "MEDIUM",
        status: "OPEN",
      },
    })

    if (session?.user) {
      await prisma.notification.create({
        data: {
          userId: (session.user as any).id,
          message: `Support ticket created: ${subject}`,
          type: "SUPPORT",
        },
      })
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}
