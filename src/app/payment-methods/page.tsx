"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiCreditCard, FiPlus, FiTrash2, FiStar } from "react-icons/fi"
import toast from "react-hot-toast"

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState("CARD")
  const [label, setLabel] = useState("")
  const [details, setDetails] = useState("")

  useEffect(() => { fetchMethods() }, [])

  async function fetchMethods() {
    try { const r = await fetch("/api/payment-methods"); if (r.ok) setMethods(await r.json()) } catch {}
    setLoading(false)
  }

  async function handleAdd() {
    if (!label || !details) { toast.error("Fill all fields"); return }
    try {
      const r = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, label, details }),
      })
      if (r.ok) { toast.success("Added!"); setShowAdd(false); setLabel(""); setDetails(""); fetchMethods() }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  async function handleDelete(id: string) {
    try {
      const r = await fetch("/api/payment-methods?id=" + id, { method: "DELETE" })
      if (r.ok) { toast.success("Removed"); fetchMethods() }
      else toast.error("Failed")
    } catch { toast.error("Failed") }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><FiCreditCard /> Payment Methods</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Manage saved payment methods</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"><FiPlus /> Add Method</motion.button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass rounded-xl p-6 card">
          <h3 className="text-lg font-bold mb-4">Add Payment Method</h3>
          <div className="space-y-3">
            <select value={type} onChange={e => setType(e.target.value)} className="input-field">
              <option value="CARD">Credit/Debit Card</option>
              <option value="PAYPAL">PayPal</option>
              <option value="BANK">Bank Account</option>
            </select>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. My Visa)" className="input-field" />
            <input type="text" value={details} onChange={e => setDetails(e.target.value)}
              placeholder={type === "CARD" ? "**** **** **** 4242" : type === "PAYPAL" ? "email@example.com" : "Bank account details"}
              className="input-field" />
            <motion.button whileHover={{ scale: 1.05 }} onClick={handleAdd} className="btn-primary">Save</motion.button>
          </div>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5 card">
        <div className="space-y-3">
          {methods.length === 0 ? (
            <p className="text-[var(--foreground)]/40 text-center py-8">No saved payment methods</p>
          ) : methods.map((m: any) => (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--card-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-white"><FiCreditCard /></div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">{m.label} {m.isDefault && <FiStar className="text-[var(--neon-yellow)]" size={14} />}</p>
                  <p className="text-xs text-[var(--foreground)]/50">{m.type} - {m.details}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 /></button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
