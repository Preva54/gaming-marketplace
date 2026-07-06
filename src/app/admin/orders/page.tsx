"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiShoppingCart, FiSearch, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiEye, FiPackage } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import type { OrderStatus } from "@/types"

interface AdminOrder {
  id: string
  customer: string
  email: string
  product: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  paymentMethod: string | null
  createdAt: Date
}



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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/orders")
        const data = await res.json()
        const items = (Array.isArray(data) ? data : []).map((o: any) => ({ ...o, createdAt: new Date(o.createdAt) }))
        setOrders(items)
      } catch { setOrders([]) }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = useMemo(() => {
    let result = orders
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "ALL") result = result.filter((o) => o.status === statusFilter)
    return result
  }, [orders, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) => o.status === "PAYMENT_SECURED" || o.status === "AWAITING_SELLER_DELIVERY").length,
    completed: orders.filter((o) => o.status === "COMPLETED" || o.status === "FUNDS_RELEASED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">Order Management</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Track and manage all marketplace orders</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: stats.total, icon: <FiShoppingCart />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { label: "Pending", value: stats.pending, icon: <FiShoppingCart />, color: "from-yellow-400 to-orange-400" },
          { label: "Processing", value: stats.processing, icon: <FiPackage />, color: "from-blue-400 to-cyan-400" },
          { label: "Completed", value: stats.completed, icon: <FiShoppingCart />, color: "from-green-400 to-teal-400" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.01 }} className="glass rounded-xl p-4 card cursor-default">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm mb-2`}>{stat.icon}</div>
            <p className="text-xs text-[var(--foreground)]/60">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input type="text" placeholder="Search by order ID, customer, or product..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-12 pr-4" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "PENDING", "PAYMENT_SECURED", "COMPLETED", "CANCELLED", "REFUND_REQUESTED", "REFUNDED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1) }}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  statusFilter === status ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"
                }`}
              >
                {status === "ALL" ? "All" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--primary)]/5">
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Order</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Customer</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Product</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Total</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Status</th>
                <th className="text-right py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-[var(--foreground)]/50">
                    <div className="w-5 h-5 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
                    <span>Loading orders...</span>
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--foreground)]/40">No orders found</td></tr>
              ) : paginated.map((order) => (
                <motion.tr
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-[var(--neon-cyan)]">{order.id}</span>
                    <p className="text-xs text-[var(--foreground)]/50">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-[var(--foreground)]/50">{order.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--foreground)]/70 max-w-[200px] truncate">{order.product} x{order.quantity}</td>
                  <td className="py-3.5 px-4 font-semibold">{formatPrice(order.totalPrice)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[order.status]}`}>{order.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--foreground)]/50 hover:text-[var(--neon-cyan)] transition-colors">
                      <FiEye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {expandedId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--card-border)]/50"
            >
              {(() => {
                const order = orders.find((o) => o.id === expandedId)
                if (!order) return null
                return (
                  <div className="p-4 bg-[var(--primary)]/3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Order ID</p>
                        <p className="text-sm font-mono text-[var(--neon-cyan)]">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Payment</p>
                        <p className="text-sm">{order.paymentMethod || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Quantity</p>
                        <p className="text-sm">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Date</p>
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between glass rounded-xl px-4 py-3 card">
          <p className="text-sm text-[var(--foreground)]/60">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "gradient-bg text-white" : "border border-[var(--card-border)] text-[var(--foreground)]/60 hover:border-[var(--neon-cyan)]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
