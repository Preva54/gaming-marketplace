"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi"
import toast from "react-hot-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false })
      if (result?.error) { toast.error("Invalid credentials"); return }
      const r = await fetch("/api/users?current=true")
      if (r.ok) {
        const user = await r.json()
        if (user.role !== "ADMIN") { toast.error("Access denied. Admins only."); return }
      }
      toast.success("Welcome, Admin!")
      router.push("/admin")
      router.refresh()
    } catch { toast.error("Something went wrong") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] flex items-center justify-center mx-auto mb-4">
            <FiShield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Admin Login</h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-1">Sign in to manage the marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 card space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
              <input type="email" placeholder="admin@nexus.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field pl-9 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field pl-9 pr-9 text-sm" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
