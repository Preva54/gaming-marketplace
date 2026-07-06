import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, addSavedPaymentMethod, removeSavedPaymentMethod } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const methods = store.savedPaymentMethods.filter((m) => m.userId === userId)
    return NextResponse.json(methods)
  } catch {
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const { type, label, details } = await req.json()
    if (!type || !label || !details) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const methods = store.savedPaymentMethods.filter((m) => m.userId === userId)
    const method = addSavedPaymentMethod(userId, { type, label, details, isDefault: methods.length === 0 })
    return NextResponse.json(method, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to add payment method" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Payment method ID required" }, { status: 400 })
    const removed = removeSavedPaymentMethod(userId, id)
    if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
  }
}
