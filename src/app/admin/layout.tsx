"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiGrid, FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiHeadphones, FiBarChart2, FiSettings, FiGift, FiShield, FiMenu, FiBell } from "react-icons/fi"
import Sidebar, { type NavItem } from "@/components/layout/Sidebar"

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <FiGrid /> },
  { href: "/admin/users", label: "Users", icon: <FiUsers /> },
  { href: "/admin/sellers", label: "Sellers", icon: <FiShield /> },
  { href: "/admin/products", label: "Products", icon: <FiPackage /> },
  { href: "/admin/orders", label: "Orders", icon: <FiShoppingCart /> },
  { href: "/admin/payments", label: "Payments", icon: <FiDollarSign /> },
  { href: "/admin/commission", label: "Commission", icon: <FiBarChart2 /> },
  { href: "/admin/refunds", label: "Refunds", icon: <FiDollarSign /> },
  { href: "/admin/support", label: "Support", icon: <FiHeadphones />, badge: 5 },
  { href: "/admin/promotions", label: "Promotions", icon: <FiGift /> },
  { href: "/admin/analytics", label: "Analytics", icon: <FiBarChart2 /> },
  { href: "/admin/settings", label: "Settings", icon: <FiSettings /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
