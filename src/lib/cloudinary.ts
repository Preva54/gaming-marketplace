import { v2 as cloudinary } from "cloudinary"

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
} catch {
  // Cloudinary config failed - will use fallback
}

export async function uploadImage(file: string, folder: string = "gaming-marketplace") {
  try {
    const result = await cloudinary.uploader.upload(file, { folder })
    return result.secure_url
  } catch {
    return null
  }
}

export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch {
    return false
  }
}

export { cloudinary }
