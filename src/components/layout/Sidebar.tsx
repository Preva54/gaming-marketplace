"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FiHome, FiShoppingBag, FiDollarSign, FiMessageSquare, FiBell, FiSettings, FiUsers, FiX } from "react-icons/fi"

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome size={20} /> },
  { href: "/dashboard/orders", label: "Orders", icon: <FiShoppingBag size={20} /> },
  { href: "/dashboard/transactions", label: "Transactions", icon: <FiDollarSign size={20} /> },
  { href: "/dashboard/messages", label: "Messages", icon: <FiMessageSquare size={20} /> },
  { href: "/dashboard/notifications", label: "Notifications", icon: <FiBell size={20} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <FiSettings size={20} /> },
]

const adminItems = [
  { href: "/admin/users", label: "Users", icon: <FiUsers size={20} /> },
  { href: "/admin/settings", label: "Admin Settings", icon: <FiSettings size={20} /> },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
  items?: NavItem[]
  title?: string
  mobileOpen?: boolean
}

export default function Sidebar({ open, onClose, items, title, mobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const isOpen = mobileOpen ?? open ?? false
  const handleClose = onClose || (() => {})

  const displayItems = items || navItems
  const displayAdminItems = items ? [] : adminItems
  const sidebarTitle = title || "Navigation"

  const NavLink = ({ href, label, icon, badge }: NavItem) => {
    const isActive = pathname === href || pathname.startsWith(href + "/")
    return (
      <Link
        href={href}
        onClick={handleClose}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
          isActive
            ? "text-white gradient-bg"
            : "text-[var(--foreground)]/70 hover:text-[var(--neon-cyan)] hover:bg-[var(--primary)]/10"
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
        {badge && (
          <span className="ml-auto text-xs bg-[var(--neon-pink)] text-white px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full gradient-bg"
          />
        )}
      </Link>
    )
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={handleClose} />
      )}
      <AnimatePresence>
        {(isOpen || true) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed lg:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 glass border-r border-[var(--card-border)] overflow-y-auto ${
              isOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between lg:hidden mb-4">
                <span className="text-sm font-semibold text-[var(--foreground)]/50 uppercase tracking-wider">{sidebarTitle}</span>
                <button onClick={handleClose} className="text-[var(--foreground)]/70 hover:text-[var(--neon-cyan)]">
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-1">
                {!items && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/40 px-4 py-2">
                    Main Menu
                  </p>
                )}
                {displayItems.map((item) => (
                  <NavLink key={item.href + item.label} {...item} />
                ))}
              </div>

              {displayAdminItems.length > 0 && (
                <div className="pt-4 mt-4 border-t border-[var(--card-border)] space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/40 px-4 py-2">
                    Admin
                  </p>
                  {displayAdminItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
