export type Role = "CUSTOMER" | "SELLER" | "ADMIN"

export type ProductCategory =
  | "GAMING_ACCOUNTS"
  | "GIFT_CARDS"
  | "GAME_KEYS"
  | "IN_GAME_CURRENCY"
  | "TOP_UPS"
  | "BOOSTING_SERVICES"
  | "COACHING_SERVICES"
  | "DIGITAL_PRODUCTS"

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_SECURED"
  | "AWAITING_SELLER_DELIVERY"
  | "DELIVERED"
  | "BUYER_REVIEWING"
  | "COMPLETED"
  | "FUNDS_RELEASED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "DISPUTED"

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export type EscrowStatus = "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED"

export type KycStatus = "NOT_STARTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED"

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED_BUYER" | "RESOLVED_SELLER" | "CLOSED"

export type WithdrawalStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED"

export type WithdrawalMethod = "BANK_TRANSFER" | "PAYPAL" | "CRYPTO"

export type WalletTransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PURCHASE"
  | "REFUND"
  | "COMMISSION"
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"
  | "ESCROW_REFUND"
  | "PROMOTIONAL_CREDIT"

export type DeliveryMethod = "DIGITAL_DELIVERY" | "ACCOUNT_DELIVERY" | "MANUAL_DELIVERY"

export interface User {
  id: string
  name: string | null
  email: string
  role: Role
  wallet: number
  avatar: string | null
  verificationStatus: string
  twoFactorEnabled: boolean
  createdAt: Date
}

export interface Product {
  id: string
  category: ProductCategory
  name: string
  description: string
  price: number
  images: string[]
  videos?: string[]
  sellerId: string
  seller?: User
  availability: boolean
  stock: number
  featured: boolean
  deliveryMethod?: DeliveryMethod
  deliveryTime?: string
  discount?: number
  discountEndsAt?: Date
  isDraft?: boolean
  createdAt: Date
}

export interface Order {
  id: string
  customerId: string
  customer?: User
  productId: string
  product?: Product
  sellerId: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  promoCode: string | null
  deliveryInfo: string | null
  deliveryMethod?: DeliveryMethod
  refundReason?: string | null
  deliveredAt?: Date | null
  confirmedAt?: Date | null
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  content: string
  attachments: string[]
  read: boolean
  createdAt: Date
}

export interface Review {
  id: string
  rating: number
  review: string
  userId: string
  user?: User
  productId: string
  product?: Product
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  message: string
  read: boolean
  type: string
  metadata?: Record<string, string>
  createdAt: Date
}

export interface Coupon {
  id: string
  code: string
  discount: number
  type: string
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  active: boolean
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface WalletInfo {
  id: string
  userId: string
  availableBalance: number
  pendingEscrowBalance: number
  pendingWithdrawalBalance: number
  lifetimeEarnings: number
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: WalletTransactionType
  amount: number
  fee: number
  netAmount: number
  reference: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  description: string
  createdAt: Date
}

export interface WithdrawalRequest {
  id: string
  userId: string
  amount: number
  method: WithdrawalMethod
  accountDetails: string
  status: WithdrawalStatus
  rejectionReason?: string
  estimatedPayoutDate?: Date
  processedAt?: Date
  createdAt: Date
}

export interface EscrowTransaction {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amount: number
  commission: number
  sellerAmount: number
  status: EscrowStatus
  confirmationPeriod: number
  autoCompleteAt?: Date
  createdAt: Date
  completedAt?: Date
}

export interface Dispute {
  id: string
  orderId: string
  escrowId: string
  raisedBy: string
  reason: string
  description: string
  evidence: string[]
  status: DisputeStatus
  resolvedBy?: string
  resolution?: string
  createdAt: Date
  resolvedAt?: Date
}

export interface KycInfo {
  id: string
  userId: string
  status: KycStatus
  documents: KycDocument[]
  rejectionReason?: string
  submittedAt?: Date
  reviewedAt?: Date
}

export interface KycDocument {
  id: string
  type: "GOVT_ID" | "SELFIE" | "PROOF_OF_ADDRESS"
  fileUrl: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
}

export interface SellerProfile {
  userId: string
  storeName: string
  storeDescription: string
  bannerImage: string | null
  avatar: string | null
  rating: number
  reviewCount: number
  totalSales: number
  totalEarnings: number
  verified: boolean
  kycStatus: KycStatus
  createdAt: Date
}

export interface CommissionConfig {
  id: string
  type: "PERCENTAGE" | "FIXED"
  rate: number
  fixedFee: number
  category: string | null
  minFee: number | null
  maxFee: number | null
  active: boolean
  createdAt: Date
}

export interface SellerAnalytics {
  totalSales: number
  totalRevenue: number
  totalCommission: number
  totalEarnings: number
  averageOrderValue: number
  salesByCategory: Record<string, number>
  salesByMonth: { month: string; sales: number; revenue: number }[]
  recentTransactions: WalletTransaction[]
}

export interface EarningsRecord {
  id: string
  orderId: string
  amount: number
  commission: number
  netAmount: number
  productName: string
  createdAt: Date
}

export interface SavedPaymentMethod {
  id: string
  userId: string
  type: "CARD" | "PAYPAL" | "BANK"
  label: string
  details: string
  isDefault: boolean
  createdAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  details: string
  ip?: string
  createdAt: Date
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  GAMING_ACCOUNTS: "Gaming Accounts",
  GIFT_CARDS: "Gift Cards",
  GAME_KEYS: "Game Keys",
  IN_GAME_CURRENCY: "In-Game Currency",
  TOP_UPS: "Top-Ups",
  BOOSTING_SERVICES: "Boosting Services",
  COACHING_SERVICES: "Coaching Services",
  DIGITAL_PRODUCTS: "Digital Products",
}

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  GAMING_ACCOUNTS: "🎮",
  GIFT_CARDS: "🎁",
  GAME_KEYS: "🔑",
  IN_GAME_CURRENCY: "💰",
  TOP_UPS: "⚡",
  BOOSTING_SERVICES: "🚀",
  COACHING_SERVICES: "📚",
  DIGITAL_PRODUCTS: "💿",
}
