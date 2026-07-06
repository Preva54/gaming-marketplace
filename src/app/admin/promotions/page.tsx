"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiGift, FiPlus, FiX, FiCheck, FiCopy, FiToggleLeft, FiToggleRight, FiTrash2, FiSearch, FiCalendar } from "react-icons/fi"
import { formatDate, generateId } from "@/lib/utils"
import toast from "react-hot-toast"

interface Coupon {
  id: string
  code: string
  discount: number
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  active: boolean
}



const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    maxUses: "",
    expiresAt: "",
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons")
      const data = await res.json()
      const items = (Array.isArray(data) ? data : []).map((c: any) => ({
        ...c,
        expiresAt: c.expiresAt ? new Date(c.expiresAt) : null,
      }))
      setCoupons(items)
    } catch { setCoupons([]) }
    finally { setLoading(false) }
  }

  const filtered = useMemo(
    () => coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase())),
    [coupons, search]
  )

  const resetForm = () => {
    setFormData({ code: "", discount: "", maxUses: "", expiresAt: "" })
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.discount) return
    try {
      const res = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: formData.code.toUpperCase(), discount: Number(formData.discount), maxUses: formData.maxUses || null, expiresAt: formData.expiresAt || null }) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to create coupon"); return }
      toast.success("Coupon created!")
      resetForm()
      fetchCoupons()
    } catch { toast.error("Failed to create coupon") }
  }

  const toggleActive = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id)
    if (!coupon) return
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !coupon.active }) })
      if (!res.ok) throw new Error()
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
      toast.success("Coupon status updated")
    } catch { toast.error("Failed to update coupon") }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success("Coupon deleted")
    } catch { toast.error("Failed to delete coupon") }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Promotions & Coupons</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Create and manage discount coupons</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Create Coupon
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
          <input type="text" placeholder="Search coupons by code..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-12 pr-4" />
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="glass rounded-xl p-6 card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create New Coupon</h2>
                <button onClick={resetForm} className="text-[var(--foreground)]/50 hover:text-[var(--neon-pink)] transition-colors"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Coupon Code</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="input-field font-mono uppercase" placeholder="e.g. SAVE20" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Discount (%)</label>
                    <input type="number" min="1" max="100" value={formData.discount} onChange={(e) => setFormData((p) => ({ ...p, discount: e.target.value }))} className="input-field" placeholder="20" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Max Uses (optional)</label>
                    <input type="number" min="0" value={formData.maxUses} onChange={(e) => setFormData((p) => ({ ...p, maxUses: e.target.value }))} className="input-field" placeholder="Unlimited" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Expiry Date (optional)</label>
                    <input type="date" value={formData.expiresAt} onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex items-center gap-2"><FiCheck size={16} /> Create Coupon</button>
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="glass rounded-xl card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--primary)]/5">
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Code</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Discount</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Usage</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Expires</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Status</th>
                <th className="text-right py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-[var(--foreground)]/50">
                    <div className="w-5 h-5 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
                    <span>Loading coupons...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--foreground)]/40">No coupons found</td></tr>
              ) : filtered.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                const isMaxed = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
                return (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--neon-cyan)]">{coupon.code}</span>
                        <button onClick={() => handleCopy(coupon.code)} className="p-1 rounded hover:bg-[var(--primary)]/10 text-[var(--foreground)]/40 hover:text-[var(--neon-cyan)] transition-colors">
                          <FiCopy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-lg font-bold gradient-text">{coupon.discount}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-[var(--primary)]/10 overflow-hidden w-24">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 0}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full gradient-bg"
                          />
                        </div>
                        <span className="text-xs text-[var(--foreground)]/50">
                          {coupon.usedCount}{coupon.maxUses !== null ? `/${coupon.maxUses}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {coupon.expiresAt ? (
                        <div className="flex items-center gap-1.5">
                          <FiCalendar size={12} className="text-[var(--foreground)]/40" />
                          <span className={`text-xs ${isExpired ? "text-red-400" : "text-[var(--foreground)]/70"}`}>
                            {formatDate(coupon.expiresAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--foreground)]/40">No expiry</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isExpired || isMaxed ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Expired</span>
                      ) : coupon.active ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Inactive</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => toggleActive(coupon.id)}
                          className={`p-2 rounded-lg transition-colors ${coupon.active ? "text-green-400 hover:bg-green-500/10" : "text-gray-500 hover:bg-gray-500/10"}`}
                        >
                          {coupon.active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--foreground)]/50 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FiGift size={40} className="mx-auto text-[var(--foreground)]/20 mb-3" />
            <p className="text-[var(--foreground)]/40">No coupons found</p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-5 card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiGift className="text-[var(--neon-yellow)]" /> Coupon Stats Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Coupons", value: coupons.length },
            { label: "Active", value: coupons.filter((c) => c.active).length },
            { label: "Total Uses", value: coupons.reduce((s, c) => s + c.usedCount, 0) },
            { label: "Avg Discount", value: `${Math.round(coupons.reduce((s, c) => s + c.discount, 0) / coupons.length)}%` },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg bg-[var(--primary)]/5 text-center">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-[var(--foreground)]/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
