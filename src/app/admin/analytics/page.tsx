"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiDownload, FiBarChart2, FiStar } from "react-icons/fi"
import { formatPrice } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const monthlyRevenue = [28500, 31200, 29800, 35200, 42100, 38900, 45600, 51200, 48700, 53400, 58900, 62300]
const userGrowth = [1200, 1450, 1320, 1580, 1720, 1650, 1890, 2100, 2250, 2430, 2600, 2847]
const topProducts = [
  { name: "Fortnite - Rare Account", sales: 342, revenue: 30775.58 },
  { name: "Valorant Points 5000", sales: 289, revenue: 14447.11 },
  { name: "Minecraft Java Edition", sales: 267, revenue: 7206.33 },
  { name: "WoW Gold 100k", sales: 198, revenue: 3958.02 },
  { name: "Steam Gift Card $50", sales: 156, revenue: 7800.00 },
]
const categoryPerformance = [
  { category: "Gaming Accounts", revenue: 45200, percentage: 28 },
  { category: "In-Game Currency", revenue: 38500, percentage: 24 },
  { category: "Game Keys", revenue: 29200, percentage: 18 },
  { category: "Gift Cards", revenue: 22400, percentage: 14 },
  { category: "Top-Ups", revenue: 16100, percentage: 10 },
  { category: "Other", revenue: 9700, percentage: 6 },
]

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")

  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b, 0)
  const totalOrders = 12480

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Deep insights into your marketplace performance</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary flex items-center gap-2 text-sm">
          <FiDownload size={16} /> Export Data
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: <FiDollarSign />, change: "+18.5%", color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: <FiShoppingCart />, change: "+12.3%", color: "from-[var(--neon-cyan)] to-[var(--neon-pink)]" },
          { label: "Total Users", value: "2,847", icon: <FiUsers />, change: "+8.7%", color: "from-[var(--neon-yellow)] to-[var(--neon-purple)]" },
          { label: "Avg. Order Value", value: formatPrice(47.32), icon: <FiBarChart2 />, change: "+5.2%", color: "from-[var(--neon-pink)] to-[var(--neon-cyan)]" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -4, scale: 1.02 }} className="glass rounded-xl p-5 card cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--foreground)]/60 text-sm">{stat.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-lg`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-green-400 mt-1">{stat.change} vs last month</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass rounded-xl p-5 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><FiTrendingUp className="text-[var(--neon-cyan)]" /> Revenue Overview</h2>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${period === p ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-44 pt-2">
            {monthlyRevenue.map((val, i) => {
              const max = Math.max(...monthlyRevenue)
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / max) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="w-full rounded-t gradient-bg relative group cursor-pointer"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--card-border)]">
                      {formatPrice(val)}
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-[var(--foreground)]/40">{months[i]}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiUsers className="text-[var(--neon-purple)]" /> User Growth</h2>
          <div className="flex items-end gap-1.5 h-44 pt-2">
            {userGrowth.map((val, i) => {
              const max = Math.max(...userGrowth)
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / max) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="w-full rounded-t bg-gradient-to-t from-[var(--neon-yellow)] to-[var(--neon-pink)] relative group cursor-pointer"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--card-border)]">
                      {val} users
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-[var(--foreground)]/40">{months[i]}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiStar className="text-[var(--neon-yellow)]" /> Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--primary)]/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-[var(--foreground)]/50">{product.sales} sales</p>
                  </div>
                </div>
                <span className="text-sm font-semibold gradient-text">{formatPrice(product.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiPackage className="text-[var(--neon-cyan)]" /> Category Performance</h2>
          <div className="space-y-4">
            {categoryPerformance.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--foreground)]/70">{cat.category}</span>
                  <div className="flex gap-3">
                    <span className="font-semibold">{formatPrice(cat.revenue)}</span>
                    <span className="text-[var(--foreground)]/50 w-8 text-right">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-[var(--primary)]/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full gradient-bg"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-5 card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiShoppingCart className="text-[var(--neon-pink)]" /> Order Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Completed", value: "9,872", percentage: 79, color: "from-green-400 to-teal-400" },
            { label: "Processing", value: "1,184", percentage: 9.5, color: "from-[var(--neon-cyan)] to-[var(--neon-purple)]" },
            { label: "Pending", value: "872", percentage: 7, color: "from-[var(--neon-yellow)] to-[var(--neon-pink)]" },
            { label: "Refunded/Cancelled", value: "552", percentage: 4.5, color: "from-red-400 to-orange-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg bg-[var(--primary)]/5">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-[var(--foreground)]/50 mt-1">{stat.label}</p>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--primary)]/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
