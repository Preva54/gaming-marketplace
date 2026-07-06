"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiHome, FiShoppingBag, FiHeart, FiMessageSquare, FiSettings, FiMenu, FiBell, FiDollarSign, FiShield, FiArrowUpRight } from "react-icons/fi"
import Sidebar, { type NavItem } from "@/components/layout/Sidebar"
import Link from "next/link"

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <FiHome /> },
  { href: "/wallet", label: "Wallet", icon: <FiDollarSign /> },
  { href: "/withdrawals", label: "Withdrawals", icon: <FiArrowUpRight /> },
  { href: "/orders", label: "My Orders", icon: <FiShoppingBag /> },
  { href: "/wishlist", label: "Wishlist", icon: <FiHeart /> },
  { href: "/kyc", label: "KYC Verification", icon: <FiShield /> },
  { href: "/support", label: "Support", icon: <FiMessageSquare /> },
  { href: "/settings", label: "Settings", icon: <FiSettings /> },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen pt-16">
      <Sidebar items={navItems} title="Dashboard" mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="glass border-b border-[var(--card-border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
            >
              <FiMenu size={22} />
            </button>
            <nav className="flex items-center gap-2 text-sm text-[var(--foreground)]/60">
              <span className="text-[var(--neon-cyan)]">Dashboard</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/wallet">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                <FiDollarSign size={14} /> Wallet
              </motion.button>
            </Link>
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
