"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FiPackage, FiDollarSign, FiTrendingUp, FiShoppingCart, FiPlus, FiStar, FiShield, FiBarChart2, FiCheckCircle, FiSend, FiClock } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

export default function SellerDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [wallet, setWallet] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deliveryInfo, setDeliveryInfo] = useState("")
  const [deliveringId, setDeliveringId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [p, o, w, sp, a] = await Promise.all([
      fetch("/api/seller/products").then(r => r.ok ? r.json() : []),
      fetch("/api/orders").then(r => r.ok ? r.json() : []),
      fetch("/api/wallet").then(r => r.ok ? r.json() : null),
      fetch("/api/seller/profile").then(r => r.ok ? r.json() : null),
      fetch("/api/seller/analytics").then(r => r.ok ? r.json() : null),
    ])
    setProducts(p || []); setOrders(o || []); setWallet(w); setProfile(sp); setAnalytics(a)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleOrderAction(orderId: string, status: string, extra?: Record<string, string>) {
    try {
      const r = await fetch(`/api/orders/${orderId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      })
      if (r.ok) { toast.success(`Order ${status.replace(/_/g, " ").toLowerCase()}!`); fetchData() }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  const totalSales = orders.filter((o: any) => o.status === "COMPLETED" || o.status === "FUNDS_RELEASED").length
  const revenue = orders.filter((o: any) => o.status === "COMPLETED" || o.status === "FUNDS_RELEASED").reduce((sum: number, o: any) => sum + o.totalPrice, 0)
  const activeListings = products.filter((p: any) => p.availability !== false && !p.isDraft).length
  const pendingActions = orders.filter((o: any) => o.status === "PAYMENT_SECURED" || o.status === "AWAITING_SELLER_DELIVERY").length
  const needsKyc = profile?.kycStatus !== "APPROVED"
  const rating = profile?.rating || 0
  const reviewCount = profile?.reviewCount || 0

  const statusColor: Record<string, string> = {
    PAYMENT_SECURED: "bg-blue-500/20 text-blue-400",
    AWAITING_SELLER_DELIVERY: "bg-purple-500/20 text-purple-400",
    DELIVERED: "bg-cyan-500/20 text-cyan-400",
    BUYER_REVIEWING: "bg-indigo-500/20 text-indigo-400",
    COMPLETED: "bg-green-500/20 text-green-400",
    FUNDS_RELEASED: "bg-emerald-500/20 text-emerald-400",
    CANCELLED: "bg-red-500/20 text-red-400",
    REFUND_REQUESTED: "bg-orange-500/20 text-orange-400",
    REFUNDED: "bg-purple-500/20 text-purple-400",
    DISPUTED: "bg-red-500/20 text-red-400",
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      {needsKyc && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 card border-[var(--neon-yellow)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiShield className="text-[var(--neon-yellow)]" size={24} />
            <div><p className="font-semibold">KYC Required</p><p className="text-sm text-[var(--foreground)]/60">Verify to start selling</p></div>
          </div>
          <Link href="/kyc"><motion.button whileHover={{ scale: 1.05 }} className="btn-primary text-sm">Verify</motion.button></Link>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Seller Dashboard</h1>
          <p className="text-[var(--foreground)]/60 mt-1">{profile?.storeName || "My Store"}</p>
        </div>
        <Link href="/seller/products">
          <motion.button whileHover={{ scale: 1.05 }} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={16} /> New Product
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Products", v: products.length, c: activeListings + " active", icon: <FiPackage />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { l: "Sales", v: totalSales, c: "completed", icon: <FiShoppingCart />, color: "from-[var(--neon-cyan)] to-[var(--neon-pink)]" },
          { l: "Revenue", v: formatPrice(revenue), c: "lifetime", icon: <FiDollarSign />, color: "from-[var(--neon-yellow)] to-[var(--neon-pink)]" },
          { l: "Need Action", v: pendingActions, c: "pending orders", icon: <FiTrendingUp />, color: "from-[var(--neon-pink)] to-[var(--neon-purple)]" },
        ].map((s) => (
          <motion.div key={s.l} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--foreground)]/60 text-sm">{s.l}</span>
              <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + s.color + " flex items-center justify-center text-white"}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold">{s.v}</p>
            <p className="text-xs text-[var(--foreground)]/40 mt-1">{s.c}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiBarChart2 className="text-[var(--neon-cyan)]" /> Orders</h2>
          {orders.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-8">No orders yet</p> : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o: any) => (
                <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-[var(--primary)]/5 border border-[var(--card-border)]/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--neon-cyan)]">{(o.id || "").slice(0, 12)}</span>
                      <span className={"text-xs px-2 py-0.5 rounded-full " + (statusColor[o.status] || "bg-gray-500/20 text-gray-400")}>
                        {(o.status || "").replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(o.totalPrice)}</span>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/60">{formatDate(o.createdAt)}</p>
                  <div className="flex gap-2 mt-2">
                    {o.status === "PAYMENT_SECURED" && (
                      <button onClick={() => handleOrderAction(o.id, "AWAITING_SELLER_DELIVERY")}
                        className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <FiCheckCircle size={12} /> Accept Order
                      </button>
                    )}
                    {o.status === "AWAITING_SELLER_DELIVERY" && (
                      <div className="flex gap-2 items-center w-full">
                        <input type="text" value={deliveringId === o.id ? deliveryInfo : ""}
                          onChange={e => { setDeliveringId(o.id); setDeliveryInfo(e.target.value) }}
                          placeholder="Delivery details (account, code, etc.)"
                          className="input-field flex-1 text-xs py-1 px-2" />
                        <button onClick={() => {
                          if (!deliveryInfo) { toast.error("Enter delivery details"); return }
                          handleOrderAction(o.id, "DELIVERED", { deliveryInfo })
                          setDeliveryInfo(""); setDeliveringId(null)
                        }} className="text-xs px-3 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                          <FiSend size={12} /> Deliver
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-5 card">
            <h2 className="text-lg font-bold mb-3">Wallet</h2>
            <p className="text-sm text-[var(--foreground)]/60">Available</p>
            <p className="text-2xl font-bold gradient-text">{formatPrice(wallet?.availableBalance || 0)}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="p-2 rounded-lg bg-[var(--primary)]/5">
                <p className="text-[10px] text-[var(--foreground)]/60">Escrow</p>
                <p className="text-sm font-semibold">{formatPrice(wallet?.pendingEscrowBalance || 0)}</p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--primary)]/5">
                <p className="text-[10px] text-[var(--foreground)]/60">Withdrawing</p>
                <p className="text-sm font-semibold">{formatPrice(wallet?.pendingWithdrawalBalance || 0)}</p>
              </div>
            </div>
            <Link href="/withdrawals">
              <motion.button whileHover={{ scale: 1.02 }} className="btn-primary w-full text-sm mt-4">Withdraw</motion.button>
            </Link>
          </div>

          <div className="glass rounded-xl p-5 card">
            <h2 className="text-lg font-bold mb-3">Sales Analytics</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]/60">Total Earnings</span>
                <span className="font-semibold gradient-text">{formatPrice(analytics?.totalEarnings || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]/60">Commission Paid</span>
                <span className="font-semibold">{formatPrice(analytics?.totalCommission || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]/60">Avg Order Value</span>
                <span className="font-semibold">{formatPrice(analytics?.averageOrderValue || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]/60">Total Transactions</span>
                <span className="font-semibold">{analytics?.totalSales || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-5 card">
        <h2 className="text-lg font-bold mb-4">Products</h2>
        {products.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-8">No products yet</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-3 px-2">Product</th><th className="text-left py-3 px-2">Price</th>
                <th className="text-left py-3 px-2">Status</th><th className="text-right py-3 px-2">Stock</th>
              </tr></thead>
              <tbody>{products.map((p: any) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                  <td className="py-3 px-2 font-medium">{p.name}</td>
                  <td className="py-3 px-2 font-semibold">{formatPrice(p.price)}</td>
                  <td className="py-3 px-2">
                    <span className={"text-xs px-2.5 py-1 rounded-full border " + (
                      p.availability !== false ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400")}>
                      {p.availability !== false ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="py-3 px-2 text-right">{p.stock || 0}</td>
                </motion.tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-5 card">
        <h2 className="text-lg font-bold mb-3">Rating</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold gradient-text">{rating}</div>
          <div>
            <div className="flex gap-1 text-[var(--neon-yellow)]">
              {[1, 2, 3, 4, 5].map((s: number) => <FiStar key={s} className={s <= rating ? "fill-current" : ""} size={16} />)}
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-1">{reviewCount} reviews</p>
          </div>
        </div>
      </div>
    </div>
  )
}
