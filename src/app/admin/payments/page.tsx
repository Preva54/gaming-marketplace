"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { FiDollarSign, FiSearch, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"

type PaymentStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED"

interface Payment {
  id: string
  type: string
  amount: number
  fee: number
  netAmount: number
  reference: string
  description: string
  status: PaymentStatus
  createdAt: Date
}



const statusColors: Record<PaymentStatus, string> = {
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

const statusIcons: Record<PaymentStatus, React.ReactNode> = {
  COMPLETED: <FiCheckCircle size={12} />,
  PENDING: <FiClock size={12} />,
  FAILED: <FiXCircle size={12} />,
  REFUNDED: <FiRefreshCw size={12} />,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/wallet/transactions")
        const data = await res.json()
        const items = (Array.isArray(data) ? data : []).map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) }))
        setPayments(items)
      } catch { setPayments([]) }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = useMemo(() => {
    let result = payments
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          (p.reference || p.id).toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.type || "").toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "ALL") result = result.filter((p) => p.status === statusFilter)
    return result
  }, [payments, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const stats = {
    totalRevenue: payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    pendingCount: payments.filter((p) => p.status === "PENDING").length,
    refundedCount: payments.filter((p) => p.status === "REFUNDED").length,
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">Payments</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Monitor transactions and payment activity</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: <FiDollarSign />, color: "from-[var(--neon-cyan)] to-[var(--neon-pink)]" },
          { label: "Transactions", value: stats.totalTransactions, icon: <FiDollarSign />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { label: "Pending", value: stats.pendingCount, icon: <FiClock />, color: "from-yellow-400 to-orange-400" },
          { label: "Refunded", value: stats.refundedCount, icon: <FiRefreshCw />, color: "from-blue-400 to-cyan-400" },
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
            <input type="text" placeholder="Search by reference, type, or description..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-12 pr-4" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "COMPLETED", "PENDING", "FAILED", "REFUNDED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1) }}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  statusFilter === status ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"
                }`}
              >
                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
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
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Transaction</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Type</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Amount</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Status</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-[var(--foreground)]/50">
                    <div className="w-5 h-5 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
                    <span>Loading payments...</span>
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-[var(--foreground)]/40">No payments found</td></tr>
              ) : paginated.map((payment) => (
                <tr key={payment.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-xs text-[var(--neon-cyan)]">{payment.reference || payment.id}</p>
                    <p className="text-xs text-[var(--foreground)]/50">{payment.description}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--foreground)]/70">{payment.type?.replace(/_/g, " ")}</td>
                  <td className="py-3.5 px-4 font-semibold">{formatPrice(Math.abs(payment.amount))}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1 w-fit ${statusColors[payment.status]}`}>
                      {statusIcons[payment.status]} {payment.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[var(--foreground)]/50">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
