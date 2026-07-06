"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiUser, FiMail, FiShield, FiEdit2, FiSave, FiCamera, FiClock, FiDollarSign, FiStar, FiPackage, FiCreditCard, FiShoppingCart } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "" })

  useEffect(() => {
    Promise.all([
      fetch("/api/users?current=true").then(r => r.ok ? r.json() : null),
      fetch("/api/wallet").then(r => r.ok ? r.json() : null),
      fetch("/api/orders").then(r => r.ok ? r.json() : []),
    ]).then(([u, w, o]) => {
      if (u) { setUser(u); setProfileForm({ name: u.name || "" }) }
      setWallet(w); setOrders(Array.isArray(o) ? o : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!user) return
    try {
      const r = await fetch(`/api/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileForm.name }),
      })
      if (r.ok) { toast.success("Profile updated!"); setEditing(false); setUser({ ...user, name: profileForm.name }) }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <div className="text-center py-16 text-[var(--foreground)]/40">Please sign in to view your profile</div>

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-bg opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full gradient-bg flex items-center justify-center text-4xl md:text-5xl font-bold">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors">
                <FiCamera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{user.name || "User"}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <FiMail size={14} /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${user.verificationStatus === "VERIFIED" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}`}>
                      <FiShield /> {user.verificationStatus === "VERIFIED" ? "Verified" : "Unverified"}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button onClick={() => setEditing(!editing)} className="btn-secondary !p-3 !rounded-xl">
                  {editing ? <FiSave /> : <FiEdit2 />}
                </button>
              </div>
              {editing && (
                <div className="mt-4 space-y-3">
                  <input type="text" value={profileForm.name}
                    onChange={(e) => setProfileForm({ name: e.target.value })}
                    className="input-field text-sm" placeholder="Name" />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary !py-2 !px-4 !text-sm">Save Changes</button>
                    <button onClick={() => setEditing(false)} className="btn-secondary !py-2 !px-4 !text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/wallet">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass rounded-xl p-5 cursor-pointer hover:border-[var(--neon-cyan)]/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400"><FiCreditCard /></div>
                <span className="text-sm text-gray-400">Wallet Balance</span>
              </div>
              <p className="text-2xl font-bold gradient-text">{formatPrice(wallet?.availableBalance || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Click to manage funds</p>
            </motion.div>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><FiStar /></div>
              <span className="text-sm text-gray-400">Member Since</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{user.createdAt ? formatDate(new Date(user.createdAt)) : "N/A"}</p>
          </motion.div>

          <Link href="/orders">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass rounded-xl p-5 cursor-pointer hover:border-[var(--neon-cyan)]/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20 text-green-400"><FiPackage /></div>
                <span className="text-sm text-gray-400">Total Orders</span>
              </div>
              <p className="text-2xl font-bold gradient-text">{orders.length}</p>
              <p className="text-xs text-gray-500 mt-1">Click to view orders</p>
            </motion.div>
          </Link>
        </div>

        {user.role === "SELLER" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiUser /> Seller Options</h2>
            <div className="flex gap-3 flex-wrap">
              <Link href="/seller" className="btn-primary !py-2 !px-4 !text-sm">Seller Dashboard</Link>
              <Link href="/seller/products" className="btn-secondary !py-2 !px-4 !text-sm">Manage Products</Link>
              <Link href="/kyc" className="btn-secondary !py-2 !px-4 !text-sm">KYC Status</Link>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FiClock /> Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet. Start shopping!</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center gap-4 py-2 border-b border-purple-500/10 last:border-0">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><FiShoppingCart /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{order.product?.name || "Order"}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(order.totalPrice)}</span>
                  <span className={"text-xs px-2 py-0.5 rounded-full " + (
                    order.status === "COMPLETED" || order.status === "FUNDS_RELEASED" ? "bg-green-500/20 text-green-400" :
                    order.status === "CANCELLED" || order.status === "REFUNDED" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400")}>
                    {(order.status || "").replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
