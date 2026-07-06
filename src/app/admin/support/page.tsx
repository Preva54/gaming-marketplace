"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiHeadphones, FiSearch, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiMessageSquare, FiCheckCircle, FiAlertCircle, FiClock, FiUser } from "react-icons/fi"
import { formatDate } from "@/lib/utils"

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

interface SupportTicket {
  id: string
  customer: string
  email: string
  subject: string
  message: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
}

const mockTickets: SupportTicket[] = [
  { id: "TKT-1001", customer: "Alex Gamer", email: "alex@example.com", subject: "Payment issue - Order #2341", message: "I paid via PayPal but the order is still pending after 2 hours.", status: "OPEN", priority: "URGENT", createdAt: new Date(2026, 5, 30) },
  { id: "TKT-1002", customer: "Sarah Seller", email: "sarah@example.com", subject: "Account recovery request", message: "I lost access to my seller account. Need help recovering it.", status: "IN_PROGRESS", priority: "HIGH", createdAt: new Date(2026, 5, 29) },
  { id: "TKT-1003", customer: "Jake Player", email: "jake@example.com", subject: "Seller verification pending", message: "I submitted my verification documents 3 days ago but still no response.", status: "OPEN", priority: "MEDIUM", createdAt: new Date(2026, 5, 28) },
  { id: "TKT-1004", customer: "Emma Trader", email: "emma@example.com", subject: "Refund not processed", message: "Requested a refund for order ORD-1005 but it hasn't been processed yet.", status: "RESOLVED", priority: "HIGH", createdAt: new Date(2026, 5, 27) },
  { id: "TKT-1005", customer: "Liam Streamer", email: "liam@example.com", subject: "Product listing issue", message: "My product images are not showing up correctly in the marketplace.", status: "OPEN", priority: "LOW", createdAt: new Date(2026, 5, 26) },
  { id: "TKT-1006", customer: "Olivia Pro", email: "olivia@example.com", subject: "Two-factor auth problem", message: "I can't log in because my 2FA code isn't being accepted.", status: "IN_PROGRESS", priority: "URGENT", createdAt: new Date(2026, 5, 25) },
  { id: "TKT-1007", customer: "Noah Gamer", email: "noah@example.com", subject: "Wrong item delivered", message: "Received a different product than what I ordered.", status: "CLOSED", priority: "HIGH", createdAt: new Date(2026, 5, 24) },
  { id: "TKT-1008", customer: "Ava Seller", email: "ava@example.com", subject: "Withdrawal request delay", message: "My withdrawal has been pending for 5 business days.", status: "OPEN", priority: "MEDIUM", createdAt: new Date(2026, 5, 23) },
]

const statusColors: Record<TicketStatus, string> = {
  OPEN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
  CLOSED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const priorityColors: Record<TicketPriority, string> = {
  LOW: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  MEDIUM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  URGENT: "bg-red-500/20 text-red-400 border-red-500/30",
}

const statusIcons: Record<TicketStatus, React.ReactNode> = {
  OPEN: <FiClock size={12} />,
  IN_PROGRESS: <FiMessageSquare size={12} />,
  RESOLVED: <FiCheckCircle size={12} />,
  CLOSED: <FiCheckCircle size={12} />,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(mockTickets)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const perPage = 5

  const filtered = useMemo(() => {
    let result = tickets
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    }
    if (statusFilter !== "ALL") result = result.filter((t) => t.status === statusFilter)
    return result
  }, [tickets, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const updateStatus = (id: string, status: TicketStatus) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    urgent: tickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED" && t.status !== "RESOLVED").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">Support Tickets</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Manage customer inquiries and support requests</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tickets", value: stats.total, icon: <FiHeadphones />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { label: "Open", value: stats.open, icon: <FiClock />, color: "from-yellow-400 to-orange-400" },
          { label: "Urgent", value: stats.urgent, icon: <FiAlertCircle />, color: "from-red-400 to-pink-400" },
          { label: "Resolved", value: stats.resolved, icon: <FiCheckCircle />, color: "from-green-400 to-teal-400" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.01 }} className="glass rounded-xl p-4 card cursor-default">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm mb-2`}>{stat.icon}</div>
            <p className="text-xs text-[var(--foreground)]/60">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input type="text" placeholder="Search by ticket ID, customer, or subject..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-12 pr-4" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1) }}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  statusFilter === status ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"
                }`}
              >
                {status === "ALL" ? "All" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        {paginated.map((ticket) => (
          <motion.div
            key={ticket.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl card overflow-hidden"
          >
            <div
              className="p-5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--neon-cyan)]">{ticket.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColors[ticket.status]}`}>
                      {statusIcons[ticket.status]} {ticket.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--foreground)]/50">
                    <span className="flex items-center gap-1"><FiUser size={12} /> {ticket.customer}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <div className="text-[var(--foreground)]/30">
                  {expandedId === ticket.id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === ticket.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-[var(--card-border)]/50"
                >
                  <div className="p-5 bg-[var(--primary)]/3 space-y-4">
                    <div>
                      <p className="text-xs text-[var(--foreground)]/50 mb-2">Message</p>
                      <p className="text-sm text-[var(--foreground)]/80 bg-[var(--background)] rounded-lg p-3 border border-[var(--card-border)]/50">
                        {ticket.message}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--foreground)]/50 mb-2">Update Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={(e) => { e.stopPropagation(); updateStatus(ticket.id, status) }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                              ticket.status === status
                                ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10"
                                : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"
                            }`}
                          >
                            {status.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between glass rounded-xl px-4 py-3 card">
          <p className="text-sm text-[var(--foreground)]/60">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "gradient-bg text-white" : "border border-[var(--card-border)] text-[var(--foreground)]/60 hover:border-[var(--neon-cyan)]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
