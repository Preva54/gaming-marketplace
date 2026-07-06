import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { store, getSellerProfile, getOrCreateSellerProfile } from "@/lib/store"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || (session.user as any).id
    let profile = getSellerProfile(userId)
    if (!profile) {
      profile = getOrCreateSellerProfile(userId, (session.user as any).name)
    }
    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: "Failed to fetch seller profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id
    const body = await req.json()
    let profile = getSellerProfile(userId)
    if (!profile) {
      profile = getOrCreateSellerProfile(userId, (session.user as any).name)
    }
    if (body.storeName !== undefined) profile.storeName = body.storeName
    if (body.storeDescription !== undefined) profile.storeDescription = body.storeDescription
    if (body.bannerImage !== undefined) profile.bannerImage = body.bannerImage
    if (body.avatar !== undefined) profile.avatar = body.avatar
    profile.updatedAt = new Date()
    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: "Failed to update seller profile" }, { status: 500 })
  }
}
