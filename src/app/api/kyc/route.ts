import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, getKyc, submitKycApplication, requestAdditionalKycDocs } from "@/lib/store"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const role = (session.user as any).role
    if (role === "ADMIN") {
      return NextResponse.json(store.kycApplications)
    }
    const kyc = getKyc(userId)
    return NextResponse.json(kyc)
  } catch {
    return NextResponse.json({ error: "Failed to fetch KYC" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const { documents } = await req.json()
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: "At least one document required" }, { status: 400 })
    }
    const result = submitKycApplication(userId, documents)
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to submit KYC" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = (session.user as any).role
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { userId, action, reason } = await req.json()
    if (action === "request_additional") {
      const result = requestAdditionalKycDocs(userId, reason || "Additional documents required")
      if (!result) return NextResponse.json({ error: "KYC not in pending review" }, { status: 400 })
      return NextResponse.json({ message: "Additional docs requested" })
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Failed to update KYC" }, { status: 500 })
  }
}
