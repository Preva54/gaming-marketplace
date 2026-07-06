"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import type { ProductCategory } from "@/types"

const DESCRIPTIONS: Record<ProductCategory, string> = {
  GAMING_ACCOUNTS: "Buy and sell verified gaming accounts with rare ranks and skins",
  GIFT_CARDS: "Digital gift cards for all major platforms and stores",
  GAME_KEYS: "Instant game keys at the best prices",
  IN_GAME_CURRENCY: "In-game currencies for your favorite titles",
  TOP_UPS: "Quick top-ups for mobile and online games",
  BOOSTING_SERVICES: "Professional rank boosting services",
  COACHING_SERVICES: "One-on-one coaching from pro players",
  DIGITAL_PRODUCTS: "Various digital goods and downloadable content",
}

const categoryEntries = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

export default function CategoriesPage() {
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products?limit=1000")
      .then(r => r.ok ? r.json() : { products: [] })
      .then(data => {
        const products = data.products || []
        const counts: Record<string, number> = {}
        for (const cat of Object.keys(CATEGORY_LABELS)) counts[cat] = 0
        for (const p of products) {
          const cat = p.category as string
          if (counts[cat] !== undefined) counts[cat]++
        }
        setItemCounts(counts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Browse Categories
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Find exactly what you need across all our gaming categories
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categoryEntries.map(([key, label]) => (
            <motion.a
              key={key}
              href={`/marketplace?category=${key}`}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="card group p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 gradient-bg opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="text-6xl md:text-7xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {CATEGORY_ICONS[key]}
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                {label}
              </h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {DESCRIPTIONS[key]}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                {itemCounts[key] ?? 0} items
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
