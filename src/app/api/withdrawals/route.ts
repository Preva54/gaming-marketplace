import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, requestWithdrawal } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role
    let withdrawals = store.withdrawalRequests
    if (role !== "ADMIN") {
      withdrawals = withdrawals.filter((w) => w.userId === userId)
    }
    withdrawals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(withdrawals)
  } catch {
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { amount, method, accountDetails } = await req.json()
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    if (!method || !accountDetails) return NextResponse.json({ error: "Missing withdrawal details" }, { status: 400 })
    const userId = (session.user as any).id
    const withdrawal = requestWithdrawal(userId, amount, method, accountDetails)
    if (!withdrawal) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    return NextResponse.json(withdrawal, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 })
  }
}
