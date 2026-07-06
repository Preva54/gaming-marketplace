"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiPercent, FiDollarSign, FiPlus, FiEdit2, FiCheck, FiX, FiSliders, FiTag } from "react-icons/fi"
import toast from "react-hot-toast"

interface CommissionConfig {
  id: string
  type: "PERCENTAGE" | "FIXED"
  rate: number
  fixedFee: number
  category: string | null
  minFee: number | null
  maxFee: number | null
  active: boolean
  createdAt: string
}

export default function AdminCommissionPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ type: "PERCENTAGE", rate: "5", fixedFee: "0", category: "", minFee: "", maxFee: "", active: true })

  useEffect(() => { fetchConfigs() }, [])

  async function fetchConfigs() {
    try { const r = await fetch("/api/commission"); if (r.ok) setConfigs(await r.json()) } catch {}
    setLoading(false)
  }

  async function handleSave() {
    try {
      const body: Record<string, unknown> = {
        ...(editingId ? { id: editingId } : {}),
        type: form.type,
        rate: parseFloat(form.rate) / 100,
        fixedFee: parseFloat(form.fixedFee),
        category: form.category || null,
        minFee: form.minFee ? parseFloat(form.minFee) : null,
        maxFee: form.maxFee ? parseFloat(form.maxFee) : null,
        active: form.active,
      }
      const r = await fetch("/api/commission", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (r.ok) { toast.success(editingId ? "Config updated!" : "Config created!"); setShowForm(false); setEditingId(null); fetchConfigs() }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  function startEdit(c: CommissionConfig) {
    setForm({
      type: c.type, rate: String(c.rate * 100), fixedFee: String(c.fixedFee),
      category: c.category || "", minFee: c.minFee ? String(c.minFee) : "",
      maxFee: c.maxFee ? String(c.maxFee) : "", active: c.active,
    })
    setEditingId(c.id); setShowForm(true)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Commission Configuration</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Manage platform fees and commission rates</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingId(null); setForm({ type: "PERCENTAGE", rate: "5", fixedFee: "0", category: "", minFee: "", maxFee: "", active: true }); setShowForm(!showForm) }}
          className="btn-primary flex items-center gap-2"><FiPlus size={18} /> New Config</motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass rounded-xl p-6 card overflow-hidden">
          <h3 className="text-lg font-bold mb-4">{editingId ? "Edit" : "New"} Commission Config</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Fee ($)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">{form.type === "PERCENTAGE" ? "Rate (%)" : "Fixed Fee ($)"}</label>
              <input type="number" step="0.1" value={form.type === "PERCENTAGE" ? form.rate : form.fixedFee}
                onChange={e => form.type === "PERCENTAGE" ? setForm(p => ({ ...p, rate: e.target.value })) : setForm(p => ({ ...p, fixedFee: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Category (optional)</label>
              <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="Leave empty for default" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Min Fee (optional)</label>
              <input type="number" step="0.01" value={form.minFee} onChange={e => setForm(p => ({ ...p, minFee: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Max Fee (optional)</label>
              <input type="number" step="0.01" value={form.maxFee} onChange={e => setForm(p => ({ ...p, maxFee: e.target.value }))} className="input-field" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2"><FiCheck size={16} /> Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-secondary">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5 card">
        <h2 className="text-lg font-bold mb-4">Commission Rules</h2>
        {configs.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-8">No commission configs</p> : (
          <div className="space-y-3">
            {configs.map(c => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--card-border)]">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {c.type === "PERCENTAGE" ? <FiPercent className="text-[var(--neon-cyan)]" /> : <FiDollarSign className="text-[var(--neon-yellow)]" />}
                    <span className="font-semibold">{c.type === "PERCENTAGE" ? `${(c.rate * 100)}%` : `$${c.fixedFee}`}</span>
                    {c.category && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--neon-purple)]/20 text-[var(--neon-purple)]"><FiTag className="inline mr-1" />{c.category}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{c.active ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/50 mt-1">
                    {c.type === "PERCENTAGE" ? `${(c.rate * 100)}% of sale price` : `$${c.fixedFee} per sale`}
                    {c.minFee && ` | Min: $${c.minFee}`}{c.maxFee && ` | Max: $${c.maxFee}`}
                    {c.category ? ` | Category: ${c.category}` : " | Default (all categories)"}
                  </p>
                </div>
                <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--foreground)]/50 hover:text-[var(--neon-cyan)]">
                  <FiEdit2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
