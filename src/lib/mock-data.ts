import { hashSync } from "bcryptjs"
import { inMemoryUsers } from "./user-store"
import { store, addFunds, getOrCreateSellerProfile, submitKycApplication, approveKyc } from "./store"

export function seedMockData() {
  const globalForSeed = globalThis as unknown as { _seeded?: boolean }
  if (globalForSeed._seeded) return
  globalForSeed._seeded = true

  if (inMemoryUsers.length > 0) return

  const hashedPw = hashSync("password123", 12)

  const admin = { id: "admin_1", name: "Admin", email: "admin@nexus.com", password: hashedPw, role: "ADMIN", avatar: null, verificationStatus: "VERIFIED", twoFactorEnabled: false, createdAt: new Date() }
  const buyer = { id: "buyer_1", name: "John Doe", email: "buyer@nexus.com", password: hashedPw, role: "CUSTOMER", avatar: null, verificationStatus: "VERIFIED", twoFactorEnabled: false, createdAt: new Date() }
  const seller = { id: "seller_1", name: "GameKing", email: "seller@nexus.com", password: hashedPw, role: "SELLER", avatar: null, verificationStatus: "VERIFIED", twoFactorEnabled: false, createdAt: new Date() }

  inMemoryUsers.push(admin, buyer, seller)

  addFunds(buyer.id, 500, "seed_deposit_buyer")
  addFunds(seller.id, 100, "seed_deposit_seller")

  const sellerProfile = getOrCreateSellerProfile(seller.id, "GameKing")
  sellerProfile.storeDescription = "Premium gaming accounts and keys since 2023"
  sellerProfile.bannerImage = null
  sellerProfile.verified = true
  submitKycApplication(seller.id, [
    { type: "GOVT_ID" as const, fileUrl: "/uploads/sample-id.jpg" },
    { type: "SELFIE" as const, fileUrl: "/uploads/sample-selfie.jpg" },
  ])
  approveKyc(seller.id, admin.id)

  const productItems = [
    { id: "prod_1", category: "GAMING_ACCOUNTS", name: "God of War Ragnarök - PS5 Account", description: "Full account with email access. Save data included.", price: 49.99, images: ["https://placehold.co/400x400/7c3aed/white?text=God+of+War"], sellerId: seller.id, stock: 5, featured: true },
    { id: "prod_2", category: "GIFT_CARDS", name: "1000 V-Bucks Gift Card", description: "Digital code delivered instantly.", price: 9.99, images: ["https://placehold.co/400x400/7c3aed/white?text=V-Bucks"], sellerId: seller.id, stock: 999, featured: true },
    { id: "prod_3", category: "GAME_KEYS", name: "Elden Ring Shadow of the Erdtree Key", description: "Steam key for PC. Region free.", price: 39.99, images: ["https://placehold.co/400x400/7c3aed/white?text=Elden+Ring"], sellerId: seller.id, stock: 50, featured: true },
    { id: "prod_4", category: "IN_GAME_CURRENCY", name: "FIFA 25 Ultimate Team Coins", description: "Safe delivery via trade. 1M coins.", price: 14.99, images: ["https://placehold.co/400x400/7c3aed/white?text=FIFA+25"], sellerId: seller.id, stock: 1000, featured: true },
    { id: "prod_5", category: "BOOSTING_SERVICES", name: "CoD MW3 Rank Boost", description: "Professional boosting. 24-48h delivery.", price: 24.99, images: ["https://placehold.co/400x400/7c3aed/white?text=COD+MW3"], sellerId: seller.id, stock: 100, featured: true },
    { id: "prod_6", category: "GIFT_CARDS", name: "Steam Wallet Code $50", description: "Digital code. Works worldwide.", price: 50.0, images: ["https://placehold.co/400x400/7c3aed/white?text=Steam+$50"], sellerId: seller.id, stock: 500, featured: true },
  ]

  const globalForProducts = globalThis as unknown as { _products?: any[] }
  if (!globalForProducts._products) {
    globalForProducts._products = []
  }
  productItems.forEach((p: any) => {
    p.availability = true
    p.videos = []
    p.deliveryMethod = "DIGITAL_DELIVERY"
    p.deliveryTime = "Instant"
    p.isDraft = false
    p.createdAt = new Date()
    p.updatedAt = new Date()
    p.seller = { id: seller.id, name: seller.name, avatar: null }
    globalForProducts._products!.push(p)
  })
}
