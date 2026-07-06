"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiShield, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi"
import toast from "react-hot-toast"

export default function AdminRegisterPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  useEffect(() => {
    fetch("/api/users?current=true").then(async r => {
      if (!r.ok) throw new Error()
      const u = await r.json()
      if (u.role !== "ADMIN") { toast.error("Admins only"); router.push("/admin/login") }
      else setChecking(false)
    }).catch(() => { toast.error("Not authenticated"); router.push("/admin/login") })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "ADMIN" }),
      })
      if (r.ok) {
        toast.success("Admin account created!")
        setForm({ name: "", email: "", password: "" })
      } else {
        const d = await r.json()
        toast.error(d.error || "Failed to create")
      }
    } catch { toast.error("Something went wrong") }
    finally { setLoading(false) }
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <button onClick={() => router.push("/admin")} className="flex items-center gap-1.5 text-sm text-[var(--foreground)]/50 hover:text-[var(--neon-cyan)] mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center mx-auto mb-4">
            <FiUser size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Admin</h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-1">Add a new administrator account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 card space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
              <input type="text" placeholder="Admin Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field pl-9 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
              <input type="email" placeholder="admin@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field pl-9 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
              <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field pl-9 pr-9 text-sm" required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
            {loading ? "Creating..." : "Create Admin"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
