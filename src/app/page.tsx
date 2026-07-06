"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import CategoryCard from "@/components/ui/CategoryCard"
import ProductCard from "@/components/ui/ProductCard"
import { FiUsers, FiPackage, FiTrendingUp, FiArrowRight, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import type { ProductCategory } from "@/types"
import ScrollAnimation from "@/components/ui/ScrollAnimation"



const testimonials = [
  {
    name: "Alex K.",
    role: "Pro Gamer",
    content: "Nexus Market is my go-to for all gaming needs. Fast delivery and great prices!",
    rating: 5,
  },
  {
    name: "Sarah M.",
    role: "Game Collector",
    content: "Found rare game keys here that I couldn't find anywhere else. Highly recommend!",
    rating: 5,
  },
  {
    name: "Mike R.",
    role: "Content Creator",
    content: "The boosting services are top-notch. My viewers love watching high-rank gameplay.",
    rating: 4,
  },
  {
    name: "Emma L.",
    role: "Casual Gamer",
    content: "Easy to use, secure payments, and amazing customer support. 10/10 experience.",
    rating: 5,
  },
]

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [siteStats, setSiteStats] = useState<any>(null)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [email, setEmail] = useState("")

  useEffect(() => {
    fetch("/api/products?limit=6")
      .then(r => r.ok ? r.json() : { products: [] })
      .then(data => setFeaturedProducts(data.products || []))
      .catch(() => {})

    fetch("/api/products?limit=1000")
      .then(r => r.ok ? r.json() : { products: [], total: 0 })
      .then(data => {
        const products = data.products || []
        const counts: Record<string, number> = {}
        for (const cat of Object.keys(CATEGORY_LABELS)) counts[cat] = 0
        for (const p of products) {
          const cat = p.category as string
          if (counts[cat] !== undefined) counts[cat]++
        }
        setCategoryCounts(counts)
      })
      .catch(() => {})

    fetch("/api/analytics")
      .then(r => r.ok ? r.json() : null)
      .then(data => setSiteStats(data))
      .catch(() => {})
  }, [])

  const nextTestimonial = () => setTestimonialIndex((i) => (i + 1) % testimonials.length)
  const prevTestimonial = () => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length)

  return (
    <div className="relative">
      <ScrollAnimation>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full glass text-xs font-semibold text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 mb-6"
            >
              The Future of Gaming Commerce
            </motion.span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl">
              <span className="gradient-text">The Ultimate</span>
              <br />
              <span className="text-white">Gaming Marketplace</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto mb-10 drop-shadow-md"
            >
              Buy and sell gaming accounts, gift cards, game keys, in-game currency, and digital products with complete security.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 glow-effect"
                >
                  Explore Marketplace
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </ScrollAnimation>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Browse Categories</span>
            </h2>
            <p className="text-[var(--foreground)]/60 max-w-xl mx-auto">
              Explore thousands of digital gaming products across all categories
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Object.entries(CATEGORY_LABELS).slice(0, 8).map(([id, name], i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <CategoryCard id={id} name={name} icon={CATEGORY_ICONS[id as keyof typeof CATEGORY_ICONS]} count={categoryCounts[id] ?? 0} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative bg-[var(--primary)]/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Featured Products</span>
              </h2>
              <p className="text-[var(--foreground)]/60">Hand-picked top deals for you</p>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:flex items-center gap-2 text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-purple)] transition-colors"
            >
              View All <FiArrowRight />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-sm"
              >
                View All Products <FiArrowRight className="inline ml-1" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FiUsers, label: "Active Users", value: siteStats?.totalUsers?.toLocaleString() + "+" || "50K+", suffix: "gamers" },
              { icon: FiPackage, label: "Products Listed", value: featuredProducts.length > 0 ? (featuredProducts.length * 100).toLocaleString() + "+" : "100K+", suffix: "items" },
              { icon: FiTrendingUp, label: "Transactions", value: "$" + (siteStats?.totalRevenue?.toLocaleString() || "10M") + "+", suffix: "processed" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-8 text-center card-hover border border-[var(--card-border)] hover:border-[var(--neon-purple)]/50 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4"
                >
                  <stat.icon size={28} className="text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold gradient-text mb-1">{stat.value}</h3>
                <p className="text-sm text-[var(--foreground)]/60">
                  {stat.label} <span className="text-[var(--foreground)]/40">{stat.suffix}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative bg-[var(--primary)]/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">What Gamers Say</span>
            </h2>
            <p className="text-[var(--foreground)]/60 max-w-xl mx-auto">
              Trusted by thousands of gamers worldwide
            </p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-8 md:p-12 text-center border border-[var(--card-border)]"
              >
                <div className="flex items-center justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[testimonialIndex].rating }).map((_, i) => (
                    <FiStar key={i} size={20} className="text-[var(--accent)] fill-[var(--accent)]" />
                  ))}
                </div>
                <p className="text-lg md:text-xl text-[var(--foreground)]/80 italic mb-8 leading-relaxed">
                  &ldquo;{testimonials[testimonialIndex].content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{testimonials[testimonialIndex].name}</p>
                  <p className="text-sm text-[var(--foreground)]/50">{testimonials[testimonialIndex].role}</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors border border-[var(--card-border)]"
              >
                <FiChevronLeft size={20} />
              </motion.button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === testimonialIndex ? "w-8 gradient-bg" : "bg-[var(--foreground)]/20"
                    }`}
                  />
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors border border-[var(--card-border)]"
              >
                <FiChevronRight size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 md:p-12 border border-[var(--card-border)] relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-bg opacity-5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text">Stay in the Game</span>
              </h2>
              <p className="text-[var(--foreground)]/60 mb-8 max-w-lg mx-auto">
                Subscribe to get notified about exclusive deals, new arrivals, and gaming news.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email) {
                    toast.success("Subscribed successfully!")
                    setEmail("")
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field flex-1"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn-primary whitespace-nowrap"
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
