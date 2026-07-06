"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiChevronDown, FiChevronUp, FiAlertTriangle, FiCheck, FiChevronLeft, FiChevronRight, FiShield } from "react-icons/fi"
import { formatDate } from "@/lib/utils"
import type { Role } from "@/types"

const roleColors: Record<Role, string> = {
  CUSTOMER: "bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border-[var(--neon-purple)]/30",
  SELLER: "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border-[var(--neon-cyan)]/30",
  ADMIN: "bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] border-[var(--neon-pink)]/30",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const perPage = 8

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    try {
      const r = await fetch("/api/users")
      if (r.ok) {
        const d = await r.json()
        setUsers(Array.isArray(d.users) ? d.users : Array.isArray(d) ? d : [])
      }
    } catch {}
    setLoading(false)
  }

  const filtered = useMemo(() => {
    let result = users
    if (search) result = result.filter((u: any) => (u.name || "").toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    if (roleFilter !== "ALL") result = result.filter((u: any) => u.role === roleFilter)
    return result
  }, [users, search, roleFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">User Management</h1>
        <p className="text-[var(--foreground)]/60 mt-1">{filtered.length} users found</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input type="text" placeholder="Search users by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-12 pr-4" />
          </div>
          <div className="flex gap-2">
            {(["ALL", "CUSTOMER", "SELLER", "ADMIN"] as const).map((role) => (
              <button
                key={role}
                onClick={() => { setRoleFilter(role); setPage(1) }}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  roleFilter === role ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"
                }`}
              >
                {role === "ALL" ? "All" : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--primary)]/5">
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">User</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Role</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Status</th>
                <th className="text-right py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user: any) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                        {(user.name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name || "N/A"}</p>
                        <p className="text-xs text-[var(--foreground)]/50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${roleColors[user.role as Role] || roleColors.CUSTOMER}`}>{user.role}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {user.suspended ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                        <FiAlertTriangle size={10} /> Suspended
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1 w-fit">
                        <FiCheck size={10} /> Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--foreground)]/70 text-xs">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {expandedId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--card-border)]/50"
            >
              {(() => {
                const user = users.find((u: any) => u.id === expandedId)
                if (!user) return null
                return (
                  <div className="p-4 bg-[var(--primary)]/3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Email</p>
                        <p className="text-sm">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Role</p>
                        <p className="text-sm">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Joined</p>
                        <p className="text-sm">{user.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Verification</p>
                        <p className="text-sm">{user.verificationStatus || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between glass rounded-xl px-4 py-3 card">
          <p className="text-sm text-[var(--foreground)]/60">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page ? "gradient-bg text-white" : "border border-[var(--card-border)] text-[var(--foreground)]/60 hover:border-[var(--neon-cyan)]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
