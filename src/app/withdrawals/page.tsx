"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FiDollarSign, FiArrowUp, FiArrowDown, FiClock, FiCheckCircle, FiXCircle, FiSend, FiPlus } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("BANK_TRANSFER")
  const [accountDetails, setAccountDetails] = useState("")

  useEffect(() => { fetchWithdrawals() }, [])

  async function fetchWithdrawals() {
    try { const r = await fetch("/api/withdrawals"); if (r.ok) setWithdrawals(await r.json()) } catch {}
    setLoading(false)
  }

  async function handleSubmit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { toast.error("Invalid amount"); return }
    if (!accountDetails) { toast.error("Enter account details"); return }
    try {
      const r = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, method, accountDetails }),
      })
      if (r.ok) {
        toast.success("Withdrawal requested!")
        setShowForm(false); setAmount(""); setAccountDetails("")
        fetchWithdrawals()
      } else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    APPROVED: "bg-blue-500/20 text-blue-400",
    PROCESSING: "bg-cyan-500/20 text-cyan-400",
    COMPLETED: "bg-green-500/20 text-green-400",
    REJECTED: "bg-red-500/20 text-red-400",
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Withdrawals</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Request and track withdrawals</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> New Withdrawal
        </motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass rounded-xl p-6 card">
          <h3 className="text-lg font-bold mb-4">Request Withdrawal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" className="input-field" min="1" step="0.01" />
            </div>
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="input-field">
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="PAYPAL">PayPal</option>
                <option value="CRYPTO">Cryptocurrency</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Account Details</label>
              <input type="text" value={accountDetails} onChange={e => setAccountDetails(e.target.value)}
                placeholder="Bank account / PayPal email / Wallet address" className="input-field" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSubmit} className="btn-primary mt-4">
            <FiSend className="inline mr-2" /> Submit Request
          </motion.button>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5 card">
        <h2 className="text-lg font-bold mb-4">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <p className="text-[var(--foreground)]/40 text-center py-8">No withdrawal requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Amount</th>
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Method</th>
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w: any) => (
                  <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                    <td className="py-3 px-2 font-mono text-xs text-[var(--neon-cyan)]">{w.id.slice(0, 12)}</td>
                    <td className="py-3 px-2 font-semibold">{formatPrice(w.amount)}</td>
                    <td className="py-3 px-2 text-[var(--foreground)]/70">{w.method.replace(/_/g, " ")}</td>
                    <td className="py-3 px-2 text-[var(--foreground)]/50">{formatDate(w.createdAt)}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[w.status] || ""}`}>
                        {w.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
