"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FiGithub, FiTwitter, FiInstagram, FiMail, FiSend } from "react-icons/fi"
import { SiDiscord } from "react-icons/si"
import { useState } from "react"
import toast from "react-hot-toast"

const quickLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Categories", href: "/categories" },
  { label: "Sell Items", href: "/sell" },
  { label: "Support", href: "/support" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "FAQ", href: "/faq" },
]

const socialLinks = [
  { icon: FiGithub, href: "https://github.com", label: "GitHub" },
  { icon: FiTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: SiDiscord, href: "https://discord.com", label: "Discord" },
  { icon: FiInstagram, href: "https://instagram.com", label: "Instagram" },
]

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success("Subscribed to newsletter!")
      setEmail("")
    }
  }

  return (
    <footer className="relative border-t border-[var(--card-border)] bg-[var(--background)] overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--neon-purple)] rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--neon-cyan)] rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-bold gradient-text">Nexus Market</Link>
            <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
              The ultimate gaming marketplace. Buy and sell gaming accounts, gift cards, game keys, and digital products with complete security and ease.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--foreground)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--neon-cyan)] mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/70 hover:text-[var(--neon-purple)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--neon-cyan)] mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-[var(--foreground)]/70 hover:text-[var(--neon-purple)] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-[var(--foreground)]/70 hover:text-[var(--neon-purple)] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-sm text-[var(--foreground)]/70 hover:text-[var(--neon-purple)] transition-colors">
                  Report a Problem
                </Link>
              </li>
              <li>
                <Link href="/disputes" className="text-sm text-[var(--foreground)]/70 hover:text-[var(--neon-purple)] transition-colors">
                  Dispute Resolution
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--neon-cyan)] mb-6">Newsletter</h3>
            <p className="text-sm text-[var(--foreground)]/70 mb-4">
              Stay updated with the latest deals and gaming news.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <div className="relative flex-1">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 text-sm"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn-primary px-4 py-2 text-sm flex items-center gap-1"
              >
                <FiSend size={16} />
              </motion.button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--foreground)]/50">
            &copy; {new Date().getFullYear()} Nexus Market. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-[var(--foreground)]/50 hover:text-[var(--neon-purple)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-[var(--foreground)]/50 hover:text-[var(--neon-purple)] transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-xs text-[var(--foreground)]/50 hover:text-[var(--neon-purple)] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
