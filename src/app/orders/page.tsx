"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiPackage, FiChevronDown, FiSearch, FiMapPin, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import type { OrderStatus } from "@/types"
import toast from "react-hot-toast"

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending Payment", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  PAYMENT_SECURED: { label: "Payment Secured", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  AWAITING_SELLER_DELIVERY: { label: "Awaiting Delivery", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  DELIVERED: { label: "Delivered", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  BUYER_REVIEWING: { label: "Reviewing", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  FUNDS_RELEASED: { label: "Funds Released", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  REFUND_REQUESTED: { label: "Refund Requested", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  REFUNDED: { label: "Refunded", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  DISPUTED: { label: "Disputed", color: "bg-red-500/20 text-red-300 border-red-500/30" },
}

const STATUS_FLOW = [
  "PAYMENT_SECURED", "AWAITING_SELLER_DELIVERY", "DELIVERED",
  "BUYER_REVIEWING", "COMPLETED", "FUNDS_RELEASED"
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("All")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try { const r = await fetch("/api/orders"); if (r.ok) setOrders(await r.json()) } catch {}
    setLoading(false)
  }

  async function handleAction(orderId: string, status: string, extra?: Record<string, string>) {
    try {
      const body: Record<string, unknown> = { status, ...extra }
      const r = await fetch(`/api/orders/${orderId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (r.ok) { toast.success(`Order ${status.replace(/_/g, " ").toLowerCase()}!`); fetchOrders() }
      else { const d = await r.json(); toast.error(d.error || "Action failed") }
    } catch { toast.error("Failed") }
  }

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "All" || order.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="text-8xl mb-6">📦</div>
          <h2 className="text-3xl font-bold gradient-text mb-3">No Orders Yet</h2>
          <p className="text-gray-400 mb-8">Ready to start your gaming collection?</p>
          <a href="/marketplace" className="btn-primary inline-flex items-center gap-2">
            Start Shopping
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
            <FiPackage /> My Orders
          </h1>
          <p className="text-gray-500 mb-6">Track and manage your purchases</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", ...Object.keys(STATUS_BADGES)].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filter === f ? "gradient-bg text-white" : "glass text-gray-400 hover:border-purple-500"
                }`}>
                {f === "All" ? "All" : STATUS_BADGES[f]?.label || f.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((order, index) => {
            const badge = STATUS_BADGES[order.status] || { label: order.status, color: "bg-gray-500/20 text-gray-300" }
            const flowIndex = STATUS_FLOW.indexOf(order.status)
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }} className="glass rounded-xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full p-4 md:p-6 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-2xl shrink-0">🎮</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{order.product?.name || "Unknown Product"}</h3>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="font-bold gradient-text">{formatPrice(order.totalPrice)}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>{badge.label}</span>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expanded === order.id ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {expanded === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-purple-500/20 pt-4 space-y-3">
                        {flowIndex >= 0 && (
                          <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-2">
                            {STATUS_FLOW.map((s, i) => {
                              const isPast = i <= flowIndex
                              const isCurrent = i === flowIndex
                              return (
                                <div key={s} className="flex items-center">
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] whitespace-nowrap ${
                                    isCurrent ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30" :
                                    isPast ? "bg-green-500/20 text-green-400" : "bg-gray-500/10 text-gray-500"
                                  }`}>
                                    {isPast ? <FiCheckCircle size={10} /> : isCurrent ? <FiClock size={10} /> : <FiClock size={10} />}
                                    {s.replace(/_/g, " ")}
                                  </div>
                                  {i < STATUS_FLOW.length - 1 && <div className={`w-4 h-px ${i < flowIndex ? "bg-green-500/50" : "bg-gray-500/20"}`} />}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div><p className="text-gray-500">Quantity</p><p className="font-medium">x{order.quantity}</p></div>
                          <div><p className="text-gray-500">Payment</p><p className="font-medium">{order.paymentMethod || "Wallet"}</p></div>
                          <div><p className="text-gray-500">Date</p><p className="font-medium">{formatDate(order.createdAt)}</p></div>
                        </div>
                        {order.deliveryInfo && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FiMapPin className="shrink-0" />
                            <span>{order.deliveryInfo}</span>
                          </div>
                        )}
                        {order.refundReason && (
                          <div className="flex items-center gap-2 text-sm text-orange-400">
                            <FiAlertTriangle className="shrink-0" />
                            <span>Refund reason: {order.refundReason}</span>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2 flex-wrap">
                          {order.status === "DELIVERED" && (
                            <>
                              <button onClick={() => handleAction(order.id, "BUYER_REVIEWING")}
                                className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2">
                                <FiCheckCircle size={14} /> Confirm Delivery
                              </button>
                              <button onClick={() => handleAction(order.id, "DISPUTED")}
                                className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2">
                                <FiAlertTriangle size={14} /> Open Dispute
                              </button>
                            </>
                          )}
                          {order.status === "BUYER_REVIEWING" && (
                            <>
                              <button onClick={() => handleAction(order.id, "COMPLETED")}
                                className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2">
                                <FiCheckCircle size={14} /> Confirm & Complete
                              </button>
                              <button onClick={() => handleAction(order.id, "REFUND_REQUESTED")}
                                className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2">
                                <FiXCircle size={14} /> Request Refund
                              </button>
                            </>
                          )}
                          {(order.status === "PAYMENT_SECURED" || order.status === "PENDING") && (
                            <button onClick={() => handleAction(order.id, "CANCELLED")}
                              className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2">
                              <FiXCircle size={14} /> Cancel Order
                            </button>
                          )}
                          <a href={`/product/${order.productId}`} className="btn-secondary !py-2 !px-4 !text-sm">
                            View Product
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
