import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuid } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: "Invalid file type. Allowed: jpeg, png, webp, gif" }, { status: 400 })

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 })

    const ext = file.type.split("/")[1]
    const fileName = `${uuid()}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const filePath = path.join(uploadDir, fileName)

    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const url = `/uploads/${fileName}`
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
