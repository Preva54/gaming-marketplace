"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiHelpCircle, FiMessageSquare, FiPlus, FiClock, FiCheckCircle,
  FiAlertCircle, FiChevronRight, FiMail, FiSend, FiX,
  FiMessageCircle, FiBarChart2, FiSearch, FiFilter, FiShield,
} from "react-icons/fi"
import {
  SiDiscord, SiYoutube, SiX,
} from "react-icons/si"
import Link from "next/link"

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  messages?: { content: string }[]
}

const faqs = [
  { q: "How do I track my order?", a: "Go to your Orders page in the Dashboard to see real-time tracking for all your purchases." },
  { q: "How long does delivery take?", a: "Digital items are delivered instantly. Physical items take 3-7 business days." },
  { q: "Can I get a refund?", a: "Refunds are processed within 24-48 hours for eligible items. Check our Refund Policy." },
  { q: "How do I become a seller?", a: "Navigate to Settings > Become a Seller and complete the verification process." },
  { q: "Is my payment information secure?", a: "Yes, we use Stripe for all payment processing. We never store your card details." },
]

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
const categories = ["GENERAL", "ACCOUNT", "PAYMENT", "ORDER", "TECHNICAL", "SELLER"]

const statusConfig: Record<string, { color: string; icon: any }> = {
  OPEN: { color: "text-[var(--neon-cyan)]", icon: FiAlertCircle },
  IN_PROGRESS: { color: "text-[var(--neon-yellow)]", icon: FiClock },
  RESOLVED: { color: "text-[var(--success)]", icon: FiCheckCircle },
  CLOSED: { color: "text-[var(--foreground)]/50", icon: FiCheckCircle },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ subject: "", category: "GENERAL", message: "", priority: "MEDIUM" })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/contact")
        if (res.ok) {
          const data = await res.json()
          setTickets(Array.isArray(data) ? data : [])
        }
      } catch {}
    }
    fetchTickets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const ticket = await res.json()
        setTickets((prev) => [ticket, ...prev])
        setShowForm(false)
        setForm({ subject: "", category: "GENERAL", message: "", priority: "MEDIUM" })
      }
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Support Center</h1>
          <p className="text-[var(--foreground)]/70 max-w-2xl mx-auto">
            Get help with your orders, account, or anything else. We&apos;re here 24/7.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-[var(--card-border)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="text-[var(--neon-cyan)]" size={24} />
                  <h2 className="text-xl font-bold">Your Tickets</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
                  {showForm ? "Cancel" : "New Ticket"}
                </motion.button>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmit}
                    className="mb-6 space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--foreground)]/80">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="input-field"
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]/80">Category</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="input-field"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]/80">Priority</label>
                        <select
                          value={form.priority}
                          onChange={(e) => setForm({ ...form, priority: e.target.value })}
                          className="input-field"
                        >
                          {priorities.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--foreground)]/80">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Describe your issue in detail..."
                        required
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <FiSend size={16} />
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>

              {tickets.length === 0 ? (
                <div className="text-center py-12 text-[var(--foreground)]/50">
                  <FiMessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No tickets yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const StatusIcon = statusConfig[ticket.status]?.icon || FiHelpCircle
                    const statusColor = statusConfig[ticket.status]?.color || "text-[var(--foreground)]"
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-xl p-4 border border-[var(--card-border)] hover:border-[var(--neon-purple)]/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{ticket.subject}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs flex items-center gap-1 ${statusColor}`}>
                                <StatusIcon size={12} />
                                {ticket.status}
                              </span>
                              <span className="text-xs text-[var(--foreground)]/50">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                ticket.priority === "URGENT" ? "bg-red-500/20 text-red-400" :
                                ticket.priority === "HIGH" ? "bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)]" :
                                "bg-[var(--foreground)]/10"
                              }`}>
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                          <FiChevronRight className="text-[var(--foreground)]/30" />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-[var(--card-border)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiHelpCircle className="text-[var(--neon-yellow)]" size={24} />
                <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
              </div>
              <div className="relative mb-4">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search FAQs..."
                  className="input-field pl-10"
                />
              </div>
              <div className="space-y-2">
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className="glass rounded-xl border border-[var(--card-border)] overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--primary)]/5 transition-colors"
                    >
                      <span className="font-medium text-sm">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight className="text-[var(--neon-cyan)]" size={16} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-sm text-[var(--foreground)]/70">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-[var(--card-border)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiMessageCircle className="text-[var(--neon-pink)]" size={24} />
                <h2 className="text-lg font-bold">Live Chat</h2>
              </div>
              <p className="text-sm text-[var(--foreground)]/70 mb-4">
                Need instant help? Chat with our AI support assistant or request a human agent.
              </p>
              <Link href="/support/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <FiMessageCircle size={16} />
                  Start Chat
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 border border-[var(--card-border)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiBarChart2 className="text-[var(--neon-cyan)]" size={24} />
                <h2 className="text-lg font-bold">Quick Links</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Order Status", icon: FiClock, href: "/orders" },
                  { label: "Refund Policy", icon: FiAlertCircle, href: "/refund-policy" },
                  { label: "Terms of Service", icon: FiHelpCircle, href: "/terms" },
                  { label: "Privacy Policy", icon: FiShield, href: "/privacy" },
                ].map((link, i) => (
                  <Link key={i} href={link.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--primary)]/10 transition-colors cursor-pointer"
                    >
                      <link.icon className="text-[var(--neon-cyan)]" size={18} />
                      <span className="text-sm">{link.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 border border-[var(--card-border)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiMail className="text-[var(--neon-yellow)]" size={24} />
                <h2 className="text-lg font-bold">Contact Us</h2>
              </div>
              <p className="text-sm text-[var(--foreground)]/70 mb-4">
                Reach out via email or social media. We typically respond within 2 hours.
              </p>
              <div className="space-y-3">
                <a href="mailto:support@nexusmarket.com" className="flex items-center gap-3 text-sm text-[var(--neon-cyan)] hover:underline">
                  <FiMail size={16} />
                  support@nexusmarket.com
                </a>
                <div className="flex gap-3 pt-2">
                  <motion.a whileHover={{ scale: 1.1 }} href="#" className="p-3 rounded-xl glass border border-[var(--card-border)] hover:border-[var(--neon-cyan)] transition-all">
                    <SiDiscord className="text-[#5865F2]" size={20} />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.1 }} href="#" className="p-3 rounded-xl glass border border-[var(--card-border)] hover:border-[var(--neon-cyan)] transition-all">
                    <SiX className="text-[#1DA1F2]" size={20} />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.1 }} href="#" className="p-3 rounded-xl glass border border-[var(--card-border)] hover:border-[var(--neon-cyan)] transition-all">
                    <SiYoutube className="text-[#FF0000]" size={20} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
