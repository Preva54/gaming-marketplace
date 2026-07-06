"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiDollarSign, FiArrowUp, FiArrowDown, FiClock, FiCheckCircle, FiXCircle, FiCreditCard, FiPlus, FiRefreshCw } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface WalletData { id: string; userId: string; availableBalance: number; pendingEscrowBalance: number; pendingWithdrawalBalance: number; lifetimeEarnings: number }
interface Tx { id: string; type: string; amount: number; fee: number; netAmount: number; reference: string; status: string; description: string; createdAt: Date }

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [showDeposit, setShowDeposit] = useState(false)
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchWallet(); fetchTransactions() }, [])

  async function fetchWallet() {
    try { const r = await fetch("/api/wallet"); if (r.ok) setWallet(await r.json()) } catch {}
    setLoading(false)
  }
  async function fetchTransactions() {
    try { const r = await fetch("/api/wallet/transactions"); if (r.ok) setTransactions(await r.json()) } catch {}
  }

  async function handleDeposit() {
    const amt = parseFloat(depositAmount)
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return }
    try {
      const r = await fetch("/api/wallet/deposit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt }) })
      if (r.ok) {
        toast.success(`$${amt} deposited!`)
        setDepositAmount(""); setShowDeposit(false); fetchWallet(); fetchTransactions()
      } else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Deposit failed") }
  }

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type.toLowerCase() === filter)
  const c = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
  const i = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div variants={c} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={i} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Wallet</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Manage funds and transactions</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeposit(!showDeposit)} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Funds
        </motion.button>
      </motion.div>

      {showDeposit && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass rounded-xl p-6 card overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Add Funds</h3>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
              placeholder="Enter amount" className="input-field" min="1" step="0.01" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleDeposit} className="btn-primary whitespace-nowrap">
              <FiDollarSign className="inline mr-1" /> Deposit
            </motion.button>
          </div>
        </motion.div>
      )}

      <motion.div variants={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available", val: formatPrice(wallet?.availableBalance || 0), icon: <FiDollarSign />, color: "from-green-400 to-[var(--neon-cyan)]" },
          { label: "In Escrow", val: formatPrice(wallet?.pendingEscrowBalance || 0), icon: <FiClock />, color: "from-[var(--neon-yellow)] to-orange-400" },
          { label: "Pending Withdrawal", val: formatPrice(wallet?.pendingWithdrawalBalance || 0), icon: <FiArrowUp />, color: "from-[var(--neon-pink)] to-[var(--neon-purple)]" },
          { label: "Lifetime Earnings", val: formatPrice(wallet?.lifetimeEarnings || 0), icon: <FiArrowDown />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--foreground)]/60 text-sm">{s.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold">{s.val}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={i} className="glass rounded-xl p-5 card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><FiCreditCard className="text-[var(--neon-cyan)]" /> Transactions</h2>
          <div className="flex gap-2 flex-wrap">
            {["all", "deposit", "withdrawal", "purchase", "escrow_release", "escrow_refund"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-[var(--neon-cyan)]/20 border-[var(--neon-cyan)] text-[var(--neon-cyan)]" : "border-[var(--card-border)] text-[var(--foreground)]/60"}`}>
                {f.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-8">No transactions</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Type</th>
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Description</th>
                  <th className="text-left py-3 px-2 text-[var(--foreground)]/60 font-medium">Date</th>
                  <th className="text-right py-3 px-2 text-[var(--foreground)]/60 font-medium">Amount</th>
                  <th className="text-right py-3 px-2 text-[var(--foreground)]/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                    <td className="py-3 px-2"><span className={`flex items-center gap-1.5 ${tx.type.includes("DEPOSIT") ? "text-green-400" : tx.type.includes("WITHDRAWAL") ? "text-red-400" : "text-[var(--neon-cyan)]"}`}>
                      {tx.type.includes("DEPOSIT") ? <FiArrowDown size={14} /> : tx.type.includes("WITHDRAWAL") ? <FiArrowUp size={14} /> : <FiRefreshCw size={14} />}
                      {tx.type.replace(/_/g, " ")}</span></td>
                    <td className="py-3 px-2 text-[var(--foreground)]/70">{tx.description}</td>
                    <td className="py-3 px-2 text-[var(--foreground)]/50">{formatDate(tx.createdAt)}</td>
                    <td className={`py-3 px-2 text-right font-semibold ${tx.netAmount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {tx.netAmount >= 0 ? "+" : ""}{formatPrice(tx.netAmount)}</td>
                    <td className="py-3 px-2 text-right">
                      {tx.status === "COMPLETED" ? <FiCheckCircle className="inline text-green-400" /> :
                       tx.status === "FAILED" ? <FiXCircle className="inline text-red-400" /> :
                       <FiClock className="inline text-[var(--neon-yellow)]" />}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
