"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { FiGrid, FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiHeadphones, FiBarChart2, FiSettings, FiGift, FiShield, FiMenu, FiBell, FiShieldOff, FiLogIn, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi"
import Sidebar, { type NavItem } from "@/components/layout/Sidebar"
import toast from "react-hot-toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openTicketCount, setOpenTicketCount] = useState(0)
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "authenticated">("loading")
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/users?current=true")
        if (res.ok) {
          const user = await res.json()
          if (user.role === "ADMIN") {
            setAuthState("authenticated")
            const ticketRes = await fetch("/api/contact?status=OPEN")
            if (ticketRes.ok) {
              const data = await ticketRes.json()
              setOpenTicketCount(Array.isArray(data) ? data.length : 0)
            }
            return
          }
        }
      } catch {}
      setAuthState("unauthenticated")
    })()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const result = await signIn("credentials", { email: loginForm.email, password: loginForm.password, redirect: false })
      if (result?.error) { toast.error("Invalid credentials"); return }
      router.refresh()
      window.location.reload()
    } catch { toast.error("Something went wrong") }
    finally { setLoginLoading(false) }
  }

  if (authState === "loading") {
    return <div className="h-screen flex items-center justify-center bg-[var(--background)]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] flex items-center justify-center mx-auto mb-4">
              <FiShield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Admin Access</h1>
            <p className="text-sm text-[var(--foreground)]/50 mt-1">Sign in to manage the marketplace</p>
          </div>

          <form onSubmit={handleLogin} className="glass rounded-xl p-6 card space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Email</label>
              <div className="relative">
                <FiLogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
                <input type="email" placeholder="admin@nexus.com" value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="input-field pl-9 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Password</label>
              <div className="relative">
                <FiShieldOff className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
                <input type={showPassword ? "text" : "password"} placeholder="password123" value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="input-field pl-9 pr-9 text-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loginLoading}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
              {loginLoading ? "Signing in..." : "Sign In"}
            </motion.button>
            <p className="text-xs text-[var(--foreground)]/40 text-center">
              Demo: admin@nexus.com / password123
            </p>
            <div className="border-t border-[var(--card-border)] pt-4 text-center">
              <Link href="/auth/register" className="text-sm text-[var(--neon-cyan)] hover:underline inline-flex items-center gap-1">
                <FiUserPlus size={14} /> Create an account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  const navItems: NavItem[] = [
    { href: "/admin", label: "Overview", icon: <FiGrid /> },
    { href: "/admin/users", label: "Users", icon: <FiUsers /> },
    { href: "/admin/sellers", label: "Sellers", icon: <FiShield /> },
    { href: "/admin/products", label: "Products", icon: <FiPackage /> },
    { href: "/admin/orders", label: "Orders", icon: <FiShoppingCart /> },
    { href: "/admin/payments", label: "Payments", icon: <FiDollarSign /> },
    { href: "/admin/commission", label: "Commission", icon: <FiBarChart2 /> },
    { href: "/admin/refunds", label: "Refunds", icon: <FiDollarSign /> },
    { href: "/admin/support", label: "Support", icon: <FiHeadphones />, badge: openTicketCount || undefined },
    { href: "/admin/promotions", label: "Promotions", icon: <FiGift /> },
    { href: "/admin/analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { href: "/admin/settings", label: "Settings", icon: <FiSettings /> },
  ]

  return (
    <div className="flex h-screen pt-16">
      <Sidebar items={navItems} title="Admin Panel" mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="glass border-b border-[var(--card-border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors">
              <FiMenu size={22} />
            </button>
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-2 text-sm text-[var(--foreground)]/60">
                <span className="text-[var(--neon-cyan)]">Admin</span>
              </nav>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] border border-[var(--neon-pink)]/30 font-semibold">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--neon-pink)] text-white text-[10px] flex items-center justify-center font-bold">5</span>
            </motion.button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
