"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiShield, FiSearch, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiStar, FiPackage, FiDollarSign, FiAlertTriangle } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const perPage = 6

  useEffect(() => { fetchSellers() }, [])

  async function fetchSellers() {
    try {
      const r = await fetch("/api/users?role=SELLER")
      if (r.ok) { const d = await r.json(); setSellers(Array.isArray(d.users) ? d.users : Array.isArray(d) ? d : []) }
    } catch {}
    setLoading(false)
  }

  async function handleSuspend(userId: string, suspended: boolean) {
    if (suspended) {
      if (!suspendReason) { toast.error("Enter a suspension reason"); return }
      try {
        const r = await fetch(`/api/users/${userId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: true, suspensionReason: suspendReason }),
        })
        if (r.ok) { toast.success("Seller suspended"); setSuspendingId(null); setSuspendReason(""); fetchSellers() }
        else { const d = await r.json(); toast.error(d.error || "Failed") }
      } catch { toast.error("Failed") }
    } else {
      try {
        const r = await fetch(`/api/users/${userId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: false }),
        })
        if (r.ok) { toast.success("Seller unsuspended"); fetchSellers() }
        else { const d = await r.json(); toast.error(d.error || "Failed") }
      } catch { toast.error("Failed") }
    }
  }

  async function handleKycRequest(userId: string) {
    try {
      const r = await fetch(`/api/kyc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "request_additional", reason: "Additional documents required" }),
      })
      if (r.ok) toast.success("Additional KYC documents requested")
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  const filtered = useMemo(() => {
    if (!search) return sellers
    const q = search.toLowerCase()
    return sellers.filter((s: any) => (s.name || "").toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
  }, [sellers, search])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  const stats = {
    total: sellers.length,
    verified: sellers.filter((s: any) => s.verificationStatus === "VERIFIED").length,
    suspended: sellers.filter((s: any) => s.suspended).length,
    totalRevenue: 0,
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">Seller Management</h1>
        <p className="text-[var(--foreground)]/60 mt-1">{filtered.length} sellers on the platform</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sellers", value: stats.total, icon: <FiShield />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { label: "Verified", value: stats.verified, icon: <FiCheck />, color: "from-green-400 to-teal-400" },
          { label: "Suspended", value: stats.suspended, icon: <FiX />, color: "from-red-400 to-orange-400" },
          { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: <FiDollarSign />, color: "from-[var(--neon-yellow)] to-[var(--neon-pink)]" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.01 }} className="glass rounded-xl p-4 card cursor-default">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm mb-2`}>{stat.icon}</div>
            <p className="text-xs text-[var(--foreground)]/60">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
          <input type="text" placeholder="Search sellers by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-12 pr-4" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((seller: any) => (
          <motion.div
            key={seller.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-5 card cursor-pointer transition-all ${seller.suspended ? "border-red-500/30" : ""}`}
            onClick={() => setExpandedId(expandedId === seller.id ? null : seller.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${seller.suspended ? "bg-red-500/20" : "gradient-bg"}`}>
                  {(seller.name || seller.email)[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{seller.name || "N/A"}</h3>
                    {seller.role === "SELLER" && <FiCheck size={14} className="text-[var(--neon-cyan)]" />}
                    {seller.suspended && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Suspended</span>}
                  </div>
                  <p className="text-sm text-[var(--foreground)]/50">{seller.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className={`text-xs px-2 py-0.5 rounded-full ${seller.verificationStatus === "VERIFIED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {seller.verificationStatus || "UNVERIFIED"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--foreground)]/60">
                <FiShield size={14} />
                <span>{seller.role}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--foreground)]/60">
                <FiDollarSign size={14} />
                <span>{formatPrice(seller.wallet || 0)}</span>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === seller.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[var(--card-border)]/50 mt-4 pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Joined</p>
                        <p className="text-sm">{seller.createdAt ? formatDate(seller.createdAt) : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Role</p>
                        <p className="text-sm">{seller.role}</p>
                      </div>
                    </div>

                    {seller.suspended && seller.suspensionReason && (
                      <div className="mb-4 p-2 rounded bg-red-500/10 text-xs text-red-400 flex items-center gap-1">
                        <FiAlertTriangle size={12} /> {seller.suspensionReason}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleSuspend(seller.id, !seller.suspended) }}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${seller.suspended ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-red-500/30 text-red-400 hover:bg-red-500/10"}`}>
                          {seller.suspended ? "Unsuspend" : "Suspend"}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleKycRequest(seller.id) }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                          Request KYC Docs
                        </button>
                      </div>

                      {!seller.suspended && suspendingId === seller.id && (
                        <div className="flex gap-2">
                          <input type="text" value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                            placeholder="Suspension reason..." className="input-field text-xs py-1 px-2 flex-1" />
                          <button onClick={(e) => { e.stopPropagation(); handleSuspend(seller.id, true) }}
                            className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Confirm</button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
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
