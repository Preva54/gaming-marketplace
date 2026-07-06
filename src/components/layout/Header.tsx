"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FiShoppingCart, FiMenu, FiX, FiUser, FiChevronDown, FiSearch } from "react-icons/fi"
import { useCartStore } from "@/store/cartStore"
import { useSession, signOut } from "next-auth/react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/categories", label: "Categories" },
  { href: "/support", label: "Support" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const { data: session } = useSession()
  const totalItems = useCartStore((s) => s.totalItems())

  useEffect(() => { setHydrated(true) }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">Nexus Market</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
            >
              <FiSearch size={20} />
            </motion.button>

            <Link href="/cart">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
              >
                <FiShoppingCart size={22} />
                {hydrated && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--neon-pink)] text-white text-xs flex items-center justify-center font-bold"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {session?.user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.[0] || "U"}
                  </div>
                  <FiChevronDown size={16} />
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 glass rounded-lg border border-[var(--card-border)] shadow-xl overflow-hidden"
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-sm hover:bg-[var(--primary)]/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm hover:bg-[var(--primary)]/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-3 text-sm hover:bg-[var(--primary)]/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <hr className="border-[var(--card-border)]" />
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Register
                  </motion.button>
                </Link>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--card-border)]"
          >
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" size={18} />
                <input
                  type="text"
                  placeholder="Search games, accounts, gift cards..."
                  className="input-field pl-12 pr-4"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-[var(--card-border)]"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-[var(--card-border)] my-2" />
              {!session?.user && (
                <div className="flex gap-3 pt-2">
                  <Link href="/auth/login" className="flex-1 btn-secondary text-center text-sm py-2" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link href="/auth/register" className="flex-1 btn-primary text-center text-sm py-2" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
