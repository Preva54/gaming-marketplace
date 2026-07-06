'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiSave, FiCamera, FiShoppingBag, FiUser } from "react-icons/fi"
import toast from "react-hot-toast"

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [storeName, setStoreName] = useState("")
  const [storeDescription, setStoreDescription] = useState("")

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    try { const r = await fetch("/api/seller/profile"); if (r.ok) { const d = await r.json(); setProfile(d); setStoreName(d.storeName || ""); setStoreDescription(d.storeDescription || "") } } catch {}
    setLoading(false)
  }

  async function handleSave() {
    try {
      const r = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, storeDescription }),
      })
      if (r.ok) { toast.success("Profile saved!"); fetchProfile() }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><FiShoppingBag /> Store Settings</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Customize your seller profile</p>
      </div>

      <div className="glass rounded-xl p-6 card space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-3xl text-white">
            <FiCamera />
          </div>
          <div>
            <p className="font-semibold text-lg">{profile?.storeName || "My Store"}</p>
            <p className="text-sm text-[var(--foreground)]/60">
              {profile?.kycStatus === "APPROVED" ? <span className="text-green-400">Verified Seller</span> : <span className="text-yellow-400">KYC: {profile?.kycStatus?.replace(/_/g, " ")}</span>}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Store Name</label>
          <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="input-field" placeholder="My Gaming Store" />
        </div>

        <div>
          <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Store Description</label>
          <textarea value={storeDescription} onChange={e => setStoreDescription(e.target.value)} className="input-field min-h-[120px]" placeholder="Describe your store..." />
        </div>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave}
          className="btn-primary flex items-center gap-2"><FiSave /> Save Changes</motion.button>
      </div>

      <div className="glass rounded-xl p-6 card">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><FiUser /> Public Profile Preview</h2>
        <div className="p-4 rounded-lg bg-[var(--primary)]/5">
          <p className="font-bold text-lg">{storeName || "Store Name"}</p>
          <p className="text-sm text-[var(--foreground)]/60 mt-1">{storeDescription || "No description yet"}</p>
          <p className="text-xs text-[var(--foreground)]/40 mt-2">Rating: {profile?.rating || 0}/5 ({profile?.reviewCount || 0} reviews) | Sales: {profile?.totalSales || 0}</p>
        </div>
      </div>
    </motion.div>
  )
}
