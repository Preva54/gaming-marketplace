import { StoredUser } from "./user-store"

export interface KycDocument {
  id: string
  userId: string
  type: "GOVT_ID" | "SELFIE" | "PROOF_OF_ADDRESS"
  fileUrl: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}

export interface KycApplication {
  id: string
  userId: string
  documents: KycDocument[]
  status: "NOT_STARTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED"
  rejectionReason?: string
  additionalDocsRequested?: boolean
  additionalDocsReason?: string
  submittedAt?: Date
  reviewedAt?: Date
  reviewedBy?: string
  createdAt: Date
  updatedAt: Date
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
  kycStatus: "NOT_STARTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}

export interface Wallet {
  id: string
  userId: string
  availableBalance: number
  pendingEscrowBalance: number
  pendingWithdrawalBalance: number
  lifetimeEarnings: number
  createdAt: Date
  updatedAt: Date
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: "DEPOSIT" | "WITHDRAWAL" | "PURCHASE" | "REFUND" | "COMMISSION" | "ESCROW_HOLD" | "ESCROW_RELEASE" | "ESCROW_REFUND" | "PROMOTIONAL_CREDIT"
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
  method: "BANK_TRANSFER" | "PAYPAL" | "CRYPTO"
  accountDetails: string
  status: "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED"
  rejectionReason?: string
  estimatedPayoutDate?: Date
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EscrowTransaction {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amount: number
  commission: number
  commissionRate: number
  sellerAmount: number
  status: "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED"
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
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED_BUYER" | "RESOLVED_SELLER" | "CLOSED"
  resolvedBy?: string
  resolution?: string
  createdAt: Date
  resolvedAt?: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  details: string
  ip?: string
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
  updatedAt: Date
}

export interface EarningsRecord {
  id: string
  orderId: string
  sellerId: string
  productName: string
  amount: number
  commission: number
  netAmount: number
  createdAt: Date
}

const globalForStore = globalThis as unknown as {
  store?: AppStore
}

interface AppStore {
  kycApplications: KycApplication[]
  sellerProfiles: SellerProfile[]
  wallets: Wallet[]
  walletTransactions: WalletTransaction[]
  withdrawalRequests: WithdrawalRequest[]
  escrowTransactions: EscrowTransaction[]
  disputes: Dispute[]
  auditLogs: AuditLog[]
  savedPaymentMethods: SavedPaymentMethod[]
  commissionConfigs: CommissionConfig[]
  earningsHistory: EarningsRecord[]
}

function createStore(): AppStore {
  const config: CommissionConfig = {
    id: "default_commission",
    type: "PERCENTAGE",
    rate: 0.05,
    fixedFee: 0,
    category: null,
    minFee: null,
    maxFee: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return {
    kycApplications: [],
    sellerProfiles: [],
    wallets: [],
    walletTransactions: [],
    withdrawalRequests: [],
    escrowTransactions: [],
    disputes: [],
    auditLogs: [],
    savedPaymentMethods: [],
    commissionConfigs: [config],
    earningsHistory: [],
  }
}

export const store: AppStore = globalForStore.store ?? createStore()
if (process.env.NODE_ENV !== "production") globalForStore.store = store

function getWallet(userId: string): Wallet {
  let wallet = store.wallets.find((w) => w.userId === userId)
  if (!wallet) {
    wallet = {
      id: `wallet_${userId}`,
      userId,
      availableBalance: 0,
      pendingEscrowBalance: 0,
      pendingWithdrawalBalance: 0,
      lifetimeEarnings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    store.wallets.push(wallet)
  }
  return wallet
}

function getKyc(userId: string): KycApplication {
  let kyc = store.kycApplications.find((k) => k.userId === userId)
  if (!kyc) {
    kyc = {
      id: `kyc_${userId}`,
      userId,
      documents: [],
      status: "NOT_STARTED",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    store.kycApplications.push(kyc)
  }
  return kyc
}

function getSellerProfile(userId: string): SellerProfile | undefined {
  return store.sellerProfiles.find((s) => s.userId === userId)
}

function getOrCreateSellerProfile(userId: string, name?: string): SellerProfile {
  let profile = store.sellerProfiles.find((s) => s.userId === userId)
  if (!profile) {
    profile = {
      userId,
      storeName: name ? `${name}'s Store` : "My Store",
      storeDescription: "",
      bannerImage: null,
      avatar: null,
      rating: 0,
      reviewCount: 0,
      totalSales: 0,
      totalEarnings: 0,
      verified: false,
      kycStatus: "NOT_STARTED",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    store.sellerProfiles.push(profile)
  }
  return profile
}

function addTransaction(walletId: string, data: Omit<WalletTransaction, "id" | "walletId" | "createdAt">): WalletTransaction {
  const tx: WalletTransaction = {
    id: `wtx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    walletId,
    ...data,
    createdAt: new Date(),
  }
  store.walletTransactions.push(tx)
  return tx
}

function addAuditLog(userId: string, action: string, details: string): AuditLog {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    action,
    details,
    createdAt: new Date(),
  }
  store.auditLogs.push(log)
  return log
}

export function getCommissionRate(category?: string): { rate: number; fixedFee: number; commissionRate: number } {
  const activeConfigs = store.commissionConfigs.filter((c) => c.active)
  const categoryConfig = category ? activeConfigs.find((c) => c.category === category) : null
  const defaultConfig = activeConfigs.find((c) => c.category === null) || activeConfigs[0]

  const config = categoryConfig || defaultConfig || { type: "PERCENTAGE" as const, rate: 0.05, fixedFee: 0, minFee: null, maxFee: null }

  let rate = config.type === "PERCENTAGE" ? config.rate : 0
  let fixedFee = config.type === "FIXED" ? config.fixedFee : 0
  const commissionRate = rate

  return { rate, fixedFee, commissionRate }
}

export function createEscrowTransaction(order: {
  id: string
  customerId: string
  sellerId: string
  totalPrice: number
  category?: string
}): EscrowTransaction {
  const { rate, fixedFee } = getCommissionRate(order.category)
  const pctCommission = Math.round(order.totalPrice * rate * 100) / 100
  const totalCommission = Math.round((pctCommission + fixedFee) * 100) / 100
  const sellerAmount = Math.round((order.totalPrice - totalCommission) * 100) / 100

  const escrow: EscrowTransaction = {
    id: `escrow_${order.id}`,
    orderId: order.id,
    buyerId: order.customerId,
    sellerId: order.sellerId,
    amount: order.totalPrice,
    commission: totalCommission,
    commissionRate: rate,
    sellerAmount,
    status: "HELD",
    confirmationPeriod: 3,
    autoCompleteAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  }
  store.escrowTransactions.push(escrow)

  addAuditLog(order.customerId, "ESCROW_CREATED", `Escrow ${escrow.id} created for order ${order.id}, amount $${order.totalPrice}, commission $${totalCommission}`)

  return escrow
}

export function releaseEscrow(escrowId: string): EscrowTransaction | null {
  const escrow = store.escrowTransactions.find((e) => e.id === escrowId)
  if (!escrow || escrow.status !== "HELD") return null

  escrow.status = "RELEASED"
  escrow.completedAt = new Date()

  const sellerWallet = getWallet(escrow.sellerId)
  sellerWallet.availableBalance = Math.round((sellerWallet.availableBalance + escrow.sellerAmount) * 100) / 100
  sellerWallet.pendingEscrowBalance = Math.round((sellerWallet.pendingEscrowBalance - escrow.amount) * 100) / 100
  sellerWallet.lifetimeEarnings = Math.round((sellerWallet.lifetimeEarnings + escrow.sellerAmount) * 100) / 100
  sellerWallet.updatedAt = new Date()

  addTransaction(sellerWallet.id, {
    type: "ESCROW_RELEASE",
    amount: escrow.sellerAmount,
    fee: escrow.commission,
    netAmount: escrow.sellerAmount,
    reference: escrowId,
    status: "COMPLETED",
    description: "Escrow release - funds available for withdrawal",
  })

  addAuditLog(escrow.sellerId, "ESCROW_RELEASED", `Escrow ${escrowId} released, $${escrow.sellerAmount} to seller`)

  return escrow
}

export function refundEscrow(escrowId: string): EscrowTransaction | null {
  const escrow = store.escrowTransactions.find((e) => e.id === escrowId)
  if (!escrow || escrow.status !== "HELD") return null

  escrow.status = "REFUNDED"
  escrow.completedAt = new Date()

  const buyerWallet = getWallet(escrow.buyerId)
  buyerWallet.availableBalance = Math.round((buyerWallet.availableBalance + escrow.amount) * 100) / 100
  buyerWallet.updatedAt = new Date()

  addTransaction(buyerWallet.id, {
    type: "ESCROW_REFUND",
    amount: escrow.amount,
    fee: 0,
    netAmount: escrow.amount,
    reference: escrowId,
    status: "COMPLETED",
    description: "Escrow refund - funds returned to buyer",
  })

  addAuditLog(escrow.buyerId, "ESCROW_REFUNDED", `Escrow ${escrowId} refunded, $${escrow.amount} to buyer`)

  return escrow
}

export function processBuyerPurchase(userId: string, amount: number, reference: string): boolean {
  const wallet = getWallet(userId)
  if (wallet.availableBalance < amount) return false

  wallet.availableBalance = Math.round((wallet.availableBalance - amount) * 100) / 100
  wallet.updatedAt = new Date()

  addTransaction(wallet.id, {
    type: "PURCHASE",
    amount: -amount,
    fee: 0,
    netAmount: -amount,
    reference,
    status: "COMPLETED",
    description: "Purchase payment",
  })

  addAuditLog(userId, "PURCHASE_MADE", `Purchase of $${amount}, reference: ${reference}`)

  return true
}

export function addFunds(userId: string, amount: number, reference: string): Wallet {
  const wallet = getWallet(userId)
  wallet.availableBalance = Math.round((wallet.availableBalance + amount) * 100) / 100
  wallet.updatedAt = new Date()

  addTransaction(wallet.id, {
    type: "DEPOSIT",
    amount,
    fee: 0,
    netAmount: amount,
    reference,
    status: "COMPLETED",
    description: "Wallet deposit",
  })

  addAuditLog(userId, "WALLET_DEPOSIT", `Deposited $${amount}, reference: ${reference}`)

  return wallet
}

export function requestWithdrawal(userId: string, amount: number, method: WithdrawalRequest["method"], accountDetails: string): WithdrawalRequest | null {
  const wallet = getWallet(userId)
  if (wallet.availableBalance < amount) return null

  wallet.availableBalance = Math.round((wallet.availableBalance - amount) * 100) / 100
  wallet.pendingWithdrawalBalance = Math.round((wallet.pendingWithdrawalBalance + amount) * 100) / 100
  wallet.updatedAt = new Date()

  const withdrawal: WithdrawalRequest = {
    id: `wd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    amount,
    method,
    accountDetails,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  store.withdrawalRequests.push(withdrawal)

  addTransaction(wallet.id, {
    type: "WITHDRAWAL",
    amount: -amount,
    fee: 0,
    netAmount: -amount,
    reference: withdrawal.id,
    status: "PENDING",
    description: `Withdrawal via ${method}`,
  })

  addAuditLog(userId, "WITHDRAWAL_REQUESTED", `Withdrawal $${amount} via ${method}`)

  return withdrawal
}

export function approveWithdrawal(withdrawalId: string, adminId: string): WithdrawalRequest | null {
  const withdrawal = store.withdrawalRequests.find((w) => w.id === withdrawalId)
  if (!withdrawal || withdrawal.status !== "PENDING") return null

  withdrawal.status = "APPROVED"
  withdrawal.updatedAt = new Date()

  addAuditLog(adminId, "WITHDRAWAL_APPROVED", `Withdrawal ${withdrawalId} approved`)
  return withdrawal
}

export function processWithdrawal(withdrawalId: string, adminId: string): WithdrawalRequest | null {
  const withdrawal = store.withdrawalRequests.find((w) => w.id === withdrawalId)
  if (!withdrawal || (withdrawal.status !== "APPROVED" && withdrawal.status !== "PROCESSING")) return null

  withdrawal.status = "COMPLETED"
  withdrawal.processedAt = new Date()
  withdrawal.updatedAt = new Date()

  const wallet = getWallet(withdrawal.userId)
  wallet.pendingWithdrawalBalance = Math.round((wallet.pendingWithdrawalBalance - withdrawal.amount) * 100) / 100
  wallet.updatedAt = new Date()

  const tx = store.walletTransactions.find(
    (t) => t.reference === withdrawal.id && t.type === "WITHDRAWAL"
  )
  if (tx) tx.status = "COMPLETED"

  addAuditLog(adminId, "WITHDRAWAL_PROCESSED", `Withdrawal ${withdrawalId} completed`)
  return withdrawal
}

export function rejectWithdrawal(withdrawalId: string, adminId: string, reason: string): WithdrawalRequest | null {
  const withdrawal = store.withdrawalRequests.find((w) => w.id === withdrawalId)
  if (!withdrawal || withdrawal.status !== "PENDING") return null

  withdrawal.status = "REJECTED"
  withdrawal.rejectionReason = reason
  withdrawal.updatedAt = new Date()

  const wallet = getWallet(withdrawal.userId)
  wallet.availableBalance = Math.round((wallet.availableBalance + withdrawal.amount) * 100) / 100
  wallet.pendingWithdrawalBalance = Math.round((wallet.pendingWithdrawalBalance - withdrawal.amount) * 100) / 100
  wallet.updatedAt = new Date()

  const tx = store.walletTransactions.find(
    (t) => t.reference === withdrawal.id && t.type === "WITHDRAWAL"
  )
  if (tx) tx.status = "FAILED"

  addAuditLog(adminId, "WITHDRAWAL_REJECTED", `Withdrawal ${withdrawalId} rejected: ${reason}`)
  return withdrawal
}

export function submitKycApplication(userId: string, documents: { type: KycDocument["type"]; fileUrl: string }[]): KycApplication {
  const kyc = getKyc(userId)
  kyc.documents = documents.map((d) => ({
    id: `kycdoc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    type: d.type,
    fileUrl: d.fileUrl,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
  kyc.status = "PENDING_REVIEW"
  kyc.submittedAt = new Date()
  kyc.updatedAt = new Date()

  addAuditLog(userId, "KYC_SUBMITTED", `KYC application submitted with ${documents.length} documents`)
  return kyc
}

export function approveKyc(userId: string, adminId: string): KycApplication | null {
  const kyc = getKyc(userId)
  if (kyc.status !== "PENDING_REVIEW") return null

  kyc.status = "APPROVED"
  kyc.reviewedAt = new Date()
  kyc.reviewedBy = adminId
  kyc.updatedAt = new Date()

  const profile = getOrCreateSellerProfile(userId)
  profile.kycStatus = "APPROVED"
  profile.updatedAt = new Date()

  addAuditLog(adminId, "KYC_APPROVED", `KYC for user ${userId} approved`)
  return kyc
}

export function rejectKyc(userId: string, adminId: string, reason: string): KycApplication | null {
  const kyc = getKyc(userId)
  if (kyc.status !== "PENDING_REVIEW") return null

  kyc.status = "REJECTED"
  kyc.rejectionReason = reason
  kyc.reviewedAt = new Date()
  kyc.reviewedBy = adminId
  kyc.updatedAt = new Date()

  const profile = getOrCreateSellerProfile(userId)
  profile.kycStatus = "REJECTED"
  profile.updatedAt = new Date()

  addAuditLog(adminId, "KYC_REJECTED", `KYC for user ${userId} rejected: ${reason}`)
  return kyc
}

export function createDispute(escrowId: string, raisedBy: string, reason: string, description: string, evidence: string[] = []): Dispute | null {
  const escrow = store.escrowTransactions.find((e) => e.id === escrowId)
  if (!escrow || escrow.status !== "HELD") return null

  escrow.status = "DISPUTED"

  const dispute: Dispute = {
    id: `disp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    orderId: escrow.orderId,
    escrowId,
    raisedBy,
    reason,
    description,
    evidence,
    status: "OPEN",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  store.disputes.push(dispute)

  addAuditLog(raisedBy, "DISPUTE_OPENED", `Dispute on escrow ${escrowId}: ${reason}`)
  return dispute
}

export function resolveDispute(disputeId: string, adminId: string, resolution: string, outcome: "RESOLVED_BUYER" | "RESOLVED_SELLER"): Dispute | null {
  const dispute = store.disputes.find((d) => d.id === disputeId)
  if (!dispute || dispute.status !== "OPEN") return null

  dispute.status = outcome
  dispute.resolvedBy = adminId
  dispute.resolution = resolution
  dispute.resolvedAt = new Date()
  dispute.updatedAt = new Date()

  if (outcome === "RESOLVED_BUYER") {
    refundEscrow(dispute.escrowId)
  } else {
    releaseEscrow(dispute.escrowId)
  }

  addAuditLog(adminId, "DISPUTE_RESOLVED", `Dispute ${disputeId} resolved in favor of ${outcome === "RESOLVED_BUYER" ? "buyer" : "seller"}: ${resolution}`)
  return dispute
}

export function closeDispute(disputeId: string, adminId: string): Dispute | null {
  const dispute = store.disputes.find((d) => d.id === disputeId)
  if (!dispute) return null

  dispute.status = "CLOSED"
  dispute.resolvedBy = adminId
  dispute.resolvedAt = new Date()
  dispute.updatedAt = new Date()

  addAuditLog(adminId, "DISPUTE_CLOSED", `Dispute ${disputeId} closed`)
  return dispute
}

export function addSavedPaymentMethod(userId: string, data: Omit<SavedPaymentMethod, "id" | "userId" | "createdAt">): SavedPaymentMethod {
  const method: SavedPaymentMethod = {
    id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    ...data,
    createdAt: new Date(),
  }
  store.savedPaymentMethods.push(method)
  return method
}

export function removeSavedPaymentMethod(userId: string, methodId: string): boolean {
  const idx = store.savedPaymentMethods.findIndex((m) => m.id === methodId && m.userId === userId)
  if (idx === -1) return false
  store.savedPaymentMethods.splice(idx, 1)
  return true
}

export function addPromotionalCredits(userId: string, amount: number, reason: string): Wallet {
  const wallet = getWallet(userId)
  wallet.availableBalance = Math.round((wallet.availableBalance + amount) * 100) / 100
  wallet.updatedAt = new Date()

  addTransaction(wallet.id, {
    type: "PROMOTIONAL_CREDIT",
    amount,
    fee: 0,
    netAmount: amount,
    reference: "promo_" + Date.now(),
    status: "COMPLETED",
    description: reason,
  })

  addAuditLog(userId, "PROMOTIONAL_CREDIT", `Added $${amount} promotional credit: ${reason}`)
  return wallet
}

export function getEarningsHistory(sellerId: string): EarningsRecord[] {
  return store.earningsHistory
    .filter((e) => e.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addEarningsRecord(record: Omit<EarningsRecord, "id" | "createdAt">): EarningsRecord {
  const entry: EarningsRecord = {
    ...record,
    id: `earn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date(),
  }
  store.earningsHistory.push(entry)
  return entry
}

export function getSellerAnalytics(sellerId: string): {
  totalSales: number
  totalRevenue: number
  totalCommission: number
  totalEarnings: number
  averageOrderValue: number
  recentEarnings: EarningsRecord[]
} {
  const earnings = store.earningsHistory.filter((e) => e.sellerId === sellerId)
  const totalRevenue = earnings.reduce((sum, e) => sum + e.amount, 0)
  const totalCommission = earnings.reduce((sum, e) => sum + e.commission, 0)
  const totalEarnings = earnings.reduce((sum, e) => sum + e.netAmount, 0)
  const totalSales = earnings.length

  return {
    totalSales,
    totalRevenue,
    totalCommission,
    totalEarnings,
    averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    recentEarnings: earnings.slice(0, 20),
  }
}

export function getCommissionConfigs(): CommissionConfig[] {
  return [...store.commissionConfigs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateCommissionConfig(id: string, data: Partial<Omit<CommissionConfig, "id" | "createdAt" | "updatedAt">>): CommissionConfig | null {
  const config = store.commissionConfigs.find((c) => c.id === id)
  if (!config) return null
  Object.assign(config, data, { updatedAt: new Date() })
  return config
}

export function createCommissionConfig(data: Omit<CommissionConfig, "id" | "createdAt" | "updatedAt">): CommissionConfig {
  const config: CommissionConfig = {
    id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  store.commissionConfigs.push(config)
  addAuditLog("system", "COMMISSION_CONFIG_CREATED", `Commission config ${config.id} created: ${data.type} ${data.rate}`)
  return config
}

export function suspendSeller(userId: string, reason: string): boolean {
  const { inMemoryUsers } = require("./user-store")
  const user = inMemoryUsers.find((u: any) => u.id === userId)
  if (!user) return false
  ;(user as any).suspended = true
  ;(user as any).suspensionReason = reason
  addAuditLog(userId, "SELLER_SUSPENDED", `Seller suspended: ${reason}`)
  return true
}

export function unsuspendSeller(userId: string): boolean {
  const { inMemoryUsers } = require("./user-store")
  const user = inMemoryUsers.find((u: any) => u.id === userId)
  if (!user) return false
  ;(user as any).suspended = false
  ;(user as any).suspensionReason = undefined
  addAuditLog(userId, "SELLER_UNSUSPENDED", "Seller unsuspended")
  return true
}

export function requestAdditionalKycDocs(userId: string, reason: string): boolean {
  const kyc = getKyc(userId)
  if (kyc.status !== "PENDING_REVIEW") return false
  kyc.additionalDocsRequested = true
  kyc.additionalDocsReason = reason
  kyc.updatedAt = new Date()
  addAuditLog(userId, "KYC_ADDITIONAL_DOCS_REQUESTED", `Additional KYC docs requested: ${reason}`)
  return true
}

export {
  getWallet,
  getKyc,
  getSellerProfile,
  getOrCreateSellerProfile,
  addTransaction,
  addAuditLog,
}
