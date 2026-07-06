"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiSend, FiMail, FiPhone, FiMessageCircle, FiClock, FiShield } from "react-icons/fi"
import toast from "react-hot-toast"

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Message sent! We'll get back to you soon.")
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch {
      toast.error("Failed to send message. Please try again.")
    }
    setSending(false)
  }

  const supportCards = [
    { icon: <FiMail className="text-2xl" />, title: "Email Us", desc: "support@gamemarket.com", sub: "Response within 24h" },
    { icon: <FiMessageCircle className="text-2xl" />, title: "Live Chat", desc: "Chat with our team", sub: "Available 24/7" },
    { icon: <FiClock className="text-2xl" />, title: "Response Time", desc: "Avg. 2 hours", sub: "During business hours" },
    { icon: <FiShield className="text-2xl" />, title: "Secure", desc: "End-to-end encrypted", sub: "Your data is safe" },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Have a question or need help? We&apos;re here for you 24/7
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {supportCards.map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-5 text-center card"
            >
              <div className="inline-flex p-3 rounded-xl gradient-bg text-white mb-3">
                {card.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
              <p className="text-purple-300 text-xs font-medium">{card.desc}</p>
              <p className="text-gray-500 text-xs mt-1">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a topic</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Account Help">Account Help</option>
                  <option value="Payment Problem">Payment Problem</option>
                  <option value="Seller Support">Seller Support</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Report">Report a Problem</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="input-field resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? "Sending..." : <><FiSend /> Send Message</>}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-8 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold mb-6">Other Ways to Reach Us</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl gradient-bg text-white">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-400 text-sm">support@gamemarket.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl gradient-bg text-white">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-400 text-sm">+1 (555) 000-0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl gradient-bg text-white">
                    <FiMessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Chat</h3>
                    <p className="text-gray-400 text-sm">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-primary mt-8 w-full flex items-center justify-center gap-2">
              <FiMessageCircle /> Start Live Chat
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
