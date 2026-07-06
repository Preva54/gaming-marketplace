"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FiHome, FiSearch } from "react-icons/fi"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--background)]">
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <span className="text-[40vw] font-bold text-[var(--neon-purple)] select-none pointer-events-none">404</span>
      </div>

      <div className="relative z-10 text-center px-4 max-w-lg">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        >
          <div className="relative">
            <span className="text-9xl font-black gradient-text neon-text block leading-none">404</span>
            <motion.div
              animate={{
                textShadow: [
                  "0 0 20px rgba(124,58,237,0.4)",
                  "0 0 40px rgba(124,58,237,0.6)",
                  "0 0 20px rgba(124,58,237,0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 text-9xl font-black text-[var(--neon-purple)] opacity-20 blur-xl leading-none"
            >
              404
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6"
        >
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
            Lost in the Game?
          </h2>
          <p className="text-[var(--foreground)]/60 mb-8">
            This page doesn&apos;t exist. Maybe it was a glitch, or the coordinates were wrong. Either way, let&apos;s get you back to base.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(124,58,237,0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              <FiHome size={20} />
              Back to Home
            </motion.button>
          </Link>
          <Link href="/marketplace">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
            >
              <FiSearch size={20} />
              Browse Games
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 flex justify-center gap-3"
        >
          {["🎮", "🎯", "⚡", "🔥", "💎", "🕹️"].map((emoji, i) => (
            <motion.span
              key={emoji}
              className="text-2xl"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
