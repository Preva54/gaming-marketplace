import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { hashSync } from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPw = hashSync("password123", 12)
  const now = new Date()

  const adminId = "admin_1"
  const buyerId = "buyer_1"
  const sellerId = "seller_1"

  await prisma.user.createMany({
    data: [
      { id: adminId, name: "Admin", email: "admin@nexus.com", password: hashedPw, role: "ADMIN", verificationStatus: "VERIFIED", createdAt: now },
      { id: buyerId, name: "John Doe", email: "buyer@nexus.com", password: hashedPw, role: "CUSTOMER", verificationStatus: "VERIFIED", createdAt: now },
      { id: sellerId, name: "GameKing", email: "seller@nexus.com", password: hashedPw, role: "SELLER", verificationStatus: "VERIFIED", createdAt: now },
    ],
    skipDuplicates: true,
  })

  const buyerWalletId = uuidv4()
  const sellerWalletId = uuidv4()
  const adminWalletId = uuidv4()

  await prisma.wallet.createMany({
    data: [
      { id: buyerWalletId, userId: buyerId, availableBalance: 500, createdAt: now },
      { id: sellerWalletId, userId: sellerId, availableBalance: 100, createdAt: now },
      { id: adminWalletId, userId: adminId, availableBalance: 0, createdAt: now },
    ],
    skipDuplicates: true,
  })

  await prisma.walletTransaction.createMany({
    data: [
      { walletId: buyerWalletId, type: "DEPOSIT", amount: 500, fee: 0, netAmount: 500, reference: "seed_deposit_buyer", description: "Initial seed deposit", createdAt: now },
      { walletId: sellerWalletId, type: "DEPOSIT", amount: 100, fee: 0, netAmount: 100, reference: "seed_deposit_seller", description: "Initial seed deposit", createdAt: now },
    ],
  })

  await prisma.sellerProfile.create({
    data: {
      userId: sellerId,
      storeName: "GameKing",
      storeDescription: "Premium gaming accounts and keys since 2023",
      verified: true,
      totalSales: 0,
      totalEarnings: 0,
    },
  })

  const kyc = await prisma.kycApplication.create({
    data: {
      userId: sellerId,
      status: "APPROVED",
      submittedAt: now,
      reviewedAt: now,
      reviewedBy: adminId,
    },
  })

  await prisma.kycDocument.createMany({
    data: [
      { kycId: kyc.id, type: "GOVT_ID", fileUrl: "/uploads/sample-id.jpg" },
      { kycId: kyc.id, type: "SELFIE", fileUrl: "/uploads/sample-selfie.jpg" },
    ],
  })

  const products = [
    { id: "prod_1", category: "GAMING_ACCOUNTS", name: "God of War Ragnarök - PS5 Account", description: "Full account with email access. Save data included.", price: 49.99, images: ["https://placehold.co/400x400/7c3aed/white?text=God+of+War"], sellerId, stock: 5, featured: true },
    { id: "prod_2", category: "GIFT_CARDS", name: "1000 V-Bucks Gift Card", description: "Digital code delivered instantly.", price: 9.99, images: ["https://placehold.co/400x400/7c3aed/white?text=V-Bucks"], sellerId, stock: 999, featured: true },
    { id: "prod_3", category: "GAME_KEYS", name: "Elden Ring Shadow of the Erdtree Key", description: "Steam key for PC. Region free.", price: 39.99, images: ["https://placehold.co/400x400/7c3aed/white?text=Elden+Ring"], sellerId, stock: 50, featured: true },
    { id: "prod_4", category: "IN_GAME_CURRENCY", name: "FIFA 25 Ultimate Team Coins", description: "Safe delivery via trade. 1M coins.", price: 14.99, images: ["https://placehold.co/400x400/7c3aed/white?text=FIFA+25"], sellerId, stock: 1000, featured: true },
    { id: "prod_5", category: "BOOSTING_SERVICES", name: "CoD MW3 Rank Boost", description: "Professional boosting. 24-48h delivery.", price: 24.99, images: ["https://placehold.co/400x400/7c3aed/white?text=COD+MW3"], sellerId, stock: 100, featured: true },
    { id: "prod_6", category: "GIFT_CARDS", name: "Steam Wallet Code $50", description: "Digital code. Works worldwide.", price: 50.0, images: ["https://placehold.co/400x400/7c3aed/white?text=Steam+$50"], sellerId, stock: 500, featured: true },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        category: product.category as any,
        name: product.name,
        description: product.description,
        price: product.price,
        images: JSON.stringify(product.images),
        videos: "[]",
        sellerId: product.sellerId,
        stock: product.stock,
        featured: product.featured,
        availability: true,
        deliveryMethod: "DIGITAL_DELIVERY",
        deliveryTime: "Instant",
        isDraft: false,
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  console.log("Seed completed successfully!")
  console.log("  Admin: admin@nexus.com / password123")
  console.log("  Buyer: buyer@nexus.com / password123")
  console.log("  Seller: seller@nexus.com / password123")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error("Seed failed:", e.message)
    await prisma.$disconnect()
    process.exit(1)
  })
