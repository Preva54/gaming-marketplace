"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FiShoppingBag, FiPackage, FiDollarSign, FiHeart, FiArrowRight, FiClock, FiCheckCircle, FiRefreshCw, FiBell, FiPlus, FiShield } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types"
import { useSession } from "next-auth/react"

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAYMENT_SECURED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  AWAITING_SELLER_DELIVERY: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  BUYER_REVIEWING: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  FUNDS_RELEASED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUND_REQUESTED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  REFUNDED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DISPUTED: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [wallet, setWallet] = useState<any>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then(r => r.ok ? r.json() : []),
      fetch("/api/wallet").then(r => r.ok ? r.json() : null),
      fetch("/api/wishlist").then(r => r.ok ? r.json() : []),
    ]).then(([ordersData, walletData, wishlistData]) => {
      setOrders(ordersData || [])
      setWallet(walletData)
      setWishlistCount(Array.isArray(wishlistData) ? wishlistData.length : 0)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const activeOrders = orders.filter((o) => o.status === "PAYMENT_SECURED" || o.status === "AWAITING_SELLER_DELIVERY")

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Welcome back, {session?.user?.name || "Player"}!</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Here&apos;s your marketplace overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: orders.length, icon: <FiShoppingBag />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]", href: "/orders" },
          { label: "Active Orders", value: activeOrders.length, icon: <FiRefreshCw />, color: "from-[var(--neon-cyan)] to-[var(--neon-pink)]", href: "/orders" },
          { label: "Wallet Balance", value: formatPrice(wallet?.availableBalance || 0), icon: <FiDollarSign />, color: "from-[var(--neon-yellow)] to-[var(--neon-pink)]", href: "/wallet" },
          { label: "Wishlist", value: wishlistCount, icon: <FiHeart />, color: "from-[var(--neon-pink)] to-[var(--neon-purple)]", href: "/wishlist" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass rounded-xl p-5 card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--foreground)]/60 text-sm">{stat.label}</span>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-lg`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiShoppingBag className="text-[var(--neon-cyan)]" />
            Recent Orders
          </h2>
          {orders.length === 0 ? (
            <p className="text-[var(--foreground)]/40 text-center py-8">No orders yet. Start shopping!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Order</th>
                    <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Status</th>
                    <th className="text-right py-3 px-2 text-[var(--foreground)]/60 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5 transition-colors">
                      <td className="py-3 px-2 font-mono text-xs text-[var(--neon-cyan)]">{order.id.slice(0, 12)}</td>
                      <td className="py-3 px-2 text-[var(--foreground)]/70">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[order.status]}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatPrice(order.totalPrice)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {orders.length > 0 && (
            <Link href="/orders" className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors">
              View all orders <FiArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-5 card">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <FiDollarSign className="text-[var(--neon-yellow)]" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link href="/wallet">
                <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--primary)]/5 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-[var(--neon-cyan)] flex items-center justify-center text-white">
                    <FiPlus size={16} />
                  </div>
                  <span className="text-sm">Add Funds</span>
                </motion.div>
              </Link>
              <Link href="/kyc">
                <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--primary)]/5 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center text-white">
                    <FiShield size={16} />
                  </div>
                  <span className="text-sm">KYC Verification</span>
                </motion.div>
              </Link>
              <Link href="/marketplace">
                <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--primary)]/5 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] flex items-center justify-center text-white">
                    <FiShoppingBag size={16} />
                  </div>
                  <span className="text-sm">Browse Marketplace</span>
                </motion.div>
              </Link>
            </div>
          </div>

          {wallet && (
            <div className="glass rounded-xl p-5 card">
              <h2 className="text-lg font-bold mb-3">Wallet Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Available</span>
                  <span className="font-semibold text-green-400">{formatPrice(wallet.availableBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">In Escrow</span>
                  <span className="font-semibold text-[var(--neon-yellow)]">{formatPrice(wallet.pendingEscrowBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Pending Withdrawal</span>
                  <span className="font-semibold text-[var(--neon-pink)]">{formatPrice(wallet.pendingWithdrawalBalance)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
