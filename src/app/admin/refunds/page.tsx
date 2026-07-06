"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiSearch } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

export default function AdminRefundsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const r = await fetch("/api/orders?status=REFUND_REQUESTED")
      if (r.ok) setOrders(await r.json())
    } catch {}
    setLoading(false)
  }

  async function handleRefund(orderId: string, action: string) {
    try {
      const r = await fetch(`/api/orders/${orderId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "REFUNDED" : "COMPLETED" }),
      })
      if (r.ok) { toast.success(`Refund ${action === "approve" ? "approved" : "rejected"}!`); fetchOrders() }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><FiRefreshCw /> Refund Requests</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Review and process buyer refund requests</p>
      </div>

      <div className="glass rounded-xl p-5 card">
        {orders.length === 0 ? (
          <p className="text-[var(--foreground)]/40 text-center py-8">No pending refund requests</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-start justify-between p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--card-border)]">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[var(--neon-cyan)]">{o.id.slice(0, 12)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">Refund Requested</span>
                  </div>
                  <p className="text-sm font-medium">{o.product?.name || "Unknown Product"}</p>
                  <p className="text-xs text-[var(--foreground)]/60 mt-1">
                    Amount: {formatPrice(o.totalPrice)} | Customer: {o.customer?.name || o.customerId?.slice(0, 12)} | {formatDate(o.createdAt)}
                  </p>
                  {o.refundReason && (
                    <p className="text-xs text-[var(--foreground)]/50 mt-1 italic">Reason: {o.refundReason}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleRefund(o.id, "approve")}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    <FiCheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => handleRefund(o.id, "reject")}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    <FiXCircle size={14} /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
