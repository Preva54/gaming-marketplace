import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const logs = store.auditLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(logs.slice(0, 100))
  } catch {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
