"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FiUsers, FiShoppingBag, FiDollarSign, FiShield, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiTrendingUp, FiPackage, FiSettings, FiBarChart2, FiEye, FiSearch } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview")
  const [kycApps, setKycApps] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [escrows, setEscrows] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/kyc").then(r => r.ok ? r.json() : []),
      fetch("/api/withdrawals").then(r => r.ok ? r.json() : []),
      fetch("/api/escrow").then(r => r.ok ? r.json() : []),
      fetch("/api/disputes").then(r => r.ok ? r.json() : []),
      fetch("/api/users").then(async r => { const d = r.ok ? await r.json() : {}; return d.users ?? [] }),
      fetch("/api/orders").then(r => r.ok ? r.json() : []),
    ]).then(([k, w, e, d, u, o]) => {
      setKycApps(Array.isArray(k) ? k : []); setWithdrawals(Array.isArray(w) ? w : []); setEscrows(Array.isArray(e) ? e : [])
      setDisputes(Array.isArray(d) ? d : []); setUsers(Array.isArray(u) ? u : []); setOrders(Array.isArray(o) ? o : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleKycAction(userId: string, action: "approve" | "reject", reason?: string) {
    const endpoint = action === "approve" ? "/api/kyc/approve" : "/api/kyc/reject"
    const body = action === "approve" ? { userId } : { userId, reason: reason || "Documents did not meet requirements" }
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (r.ok) { toast.success("KYC " + action + "d!"); setKycApps(kycApps.filter((k: any) => k.userId !== userId)) }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  async function handleWithdrawalAction(id: string, action: string, reason?: string) {
    try {
      const r = await fetch("/api/withdrawals/" + id, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      })
      if (r.ok) { toast.success("Withdrawal " + action + "d!"); setWithdrawals(withdrawals.filter((w: any) => w.id !== id)) }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  async function handleDisputeAction(id: string, action: string, outcome?: string, resolution?: string) {
    try {
      const r = await fetch("/api/disputes/" + id, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, outcome, resolution }),
      })
      if (r.ok) { toast.success("Dispute updated!"); setDisputes(disputes.filter((d: any) => d.id !== id)) }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiBarChart2 /> },
    { id: "kyc", label: "KYC (" + kycApps.filter((k: any) => k.status === "PENDING_REVIEW").length + ")", icon: <FiShield /> },
    { id: "withdrawals", label: "Withdrawals (" + withdrawals.filter((w: any) => w.status === "PENDING").length + ")", icon: <FiDollarSign /> },
    { id: "escrows", label: "Escrows", icon: <FiClock /> },
    { id: "disputes", label: "Disputes (" + disputes.filter((d: any) => d.status === "OPEN").length + ")", icon: <FiAlertTriangle /> },
    { id: "users", label: "Users", icon: <FiUsers /> },
    { id: "orders", label: "Orders", icon: <FiShoppingBag /> },
  ]

  const pendingKyc = kycApps.filter((k: any) => k.status === "PENDING_REVIEW")
  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === "PENDING")
  const heldEscrows = escrows.filter((e: any) => e.status === "HELD")
  const openDisputes = disputes.filter((d: any) => d.status === "OPEN")

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Manage platform, users, KYC, escrows, and more</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {tabs.map((t) => (
          <motion.button key={t.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setTab(t.id)}
            className={"glass rounded-xl p-3 card text-xs flex flex-col items-center gap-1 " + (tab === t.id ? "border-[var(--neon-cyan)]" : "")}>
            <span className="text-lg">{t.icon}</span>
            <span className="text-center leading-tight">{t.label}</span>
          </motion.button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Total Users", v: users.length, icon: <FiUsers />, c: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
              { l: "Total Orders", v: orders.length, icon: <FiShoppingBag />, c: "from-[var(--neon-cyan)] to-[var(--neon-pink)]" },
              { l: "Pending KYC", v: pendingKyc.length, icon: <FiShield />, c: "from-[var(--neon-yellow)] to-[var(--neon-pink)]" },
              { l: "Open Disputes", v: openDisputes.length, icon: <FiAlertTriangle />, c: "from-[var(--neon-pink)] to-[var(--neon-purple)]" },
            ].map((s) => (
              <motion.div key={s.l} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--foreground)]/60 text-sm">{s.l}</span>
                  <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + s.c + " flex items-center justify-center text-white"}>{s.icon}</div>
                </div>
                <p className="text-2xl font-bold">{s.v}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Escrow Balance", v: formatPrice(heldEscrows.reduce((s: number, e: any) => s + e.amount, 0)), icon: <FiClock />, c: "from-[var(--neon-yellow)] to-orange-400" },
              { l: "Total Commission", v: formatPrice(escrows.reduce((s: number, e: any) => s + e.commission, 0)), icon: <FiTrendingUp />, c: "from-[var(--neon-cyan)] to-[var(--neon-purple)]" },
              { l: "Buyer Deposits", v: formatPrice(escrows.filter((e: any) => e.status === "HELD" || e.status === "RELEASED").reduce((s: number, e: any) => s + e.amount, 0)), icon: <FiDollarSign />, c: "from-green-400 to-[var(--neon-cyan)]" },
              { l: "Pending Withdrawals", v: formatPrice(pendingWithdrawals.reduce((s: number, w: any) => s + w.amount, 0)), icon: <FiPackage />, c: "from-[var(--neon-pink)] to-[var(--neon-purple)]" },
            ].map((s) => (
              <motion.div key={s.l} whileHover={{ y: -4 }} className="glass rounded-xl p-5 card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--foreground)]/60 text-sm">{s.l}</span>
                  <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + s.c + " flex items-center justify-center text-white"}>{s.icon}</div>
                </div>
                <p className="text-2xl font-bold">{s.v}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5 card">
              <h2 className="text-lg font-bold mb-4"><FiClock className="inline text-[var(--neon-yellow)] mr-2" />Held Escrows ({heldEscrows.length})</h2>
              {heldEscrows.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-4">No active escrows</p> : (
                <div className="space-y-2">
                  {heldEscrows.slice(0, 5).map((e: any) => (
                    <div key={e.id} className="flex justify-between p-3 rounded-lg bg-[var(--primary)]/5">
                      <div><p className="text-xs font-mono text-[var(--neon-cyan)]">{(e.id || "").slice(0, 16)}</p><p className="text-xs text-[var(--foreground)]/50">{formatPrice(e.amount)}</p></div>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">{e.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass rounded-xl p-5 card">
              <h2 className="text-lg font-bold mb-4"><FiDollarSign className="inline text-[var(--neon-cyan)] mr-2" />Pending Withdrawals ({pendingWithdrawals.length})</h2>
              {pendingWithdrawals.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-4">No pending withdrawals</p> : (
                <div className="space-y-2">
                  {pendingWithdrawals.slice(0, 5).map((w: any) => (
                    <div key={w.id} className="flex justify-between p-3 rounded-lg bg-[var(--primary)]/5">
                      <div><p className="text-xs font-mono text-[var(--neon-cyan)]">{(w.id || "").slice(0, 12)}</p><p className="text-xs text-[var(--foreground)]/50">{formatPrice(w.amount)} via {w.method}</p></div>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">{w.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "kyc" && (
        <div className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4"><FiShield className="inline text-[var(--neon-yellow)] mr-2" />KYC Applications</h2>
          {pendingKyc.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-8">No pending KYC applications</p> : (
            <div className="space-y-3">
              {pendingKyc.map((k: any) => (
                <motion.div key={k.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--card-border)]">
                  <div>
                    <p className="font-semibold text-sm">User: {k.userId}</p>
                    <p className="text-xs text-[var(--foreground)]/50">Submitted: {k.submittedAt ? formatDate(k.submittedAt) : "N/A"}</p>
                    <p className="text-xs text-[var(--foreground)]/50">{k.documents?.length || 0} documents</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleKycAction(k.userId, "approve")}
                      className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm">Approve</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleKycAction(k.userId, "reject", "Documents did not meet requirements")}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">Reject</motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {kycApps.filter((k: any) => k.status !== "PENDING_REVIEW").length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)]/60 mb-3">Reviewed Applications</h3>
              <div className="space-y-2">
                {kycApps.filter((k: any) => k.status !== "PENDING_REVIEW").map((k: any) => (
                  <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--primary)]/3">
                    <div>
                      <p className="text-sm">User: {k.userId}</p>
                      <p className="text-xs text-[var(--foreground)]/50">{k.reviewedAt ? formatDate(k.reviewedAt) : ""}</p>
                    </div>
                    <span className={"text-xs px-2.5 py-1 rounded-full " + (k.status === "APPROVED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>{k.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4"><FiDollarSign className="inline text-[var(--neon-cyan)] mr-2" />Withdrawal Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-3 px-2">ID</th><th className="text-left py-3 px-2">User</th>
                <th className="text-left py-3 px-2">Amount</th><th className="text-left py-3 px-2">Method</th>
                <th className="text-left py-3 px-2">Status</th><th className="text-right py-3 px-2">Actions</th>
              </tr></thead>
              <tbody>{withdrawals.map((w: any) => (
                <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                  <td className="py-3 px-2 font-mono text-xs text-[var(--neon-cyan)]">{(w.id || "").slice(0, 12)}</td>
                  <td className="py-3 px-2">{(w.userId || "").slice(0, 12)}</td>
                  <td className="py-3 px-2 font-semibold">{formatPrice(w.amount)}</td>
                  <td className="py-3 px-2 text-[var(--foreground)]/70">{w.method?.replace(/_/g, " ")}</td>
                  <td className="py-3 px-2">
                    <span className={"text-xs px-2 py-1 rounded-full " + (
                      w.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                      w.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                      w.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                      "bg-blue-500/20 text-blue-400")}>{w.status}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {w.status === "PENDING" && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleWithdrawalAction(w.id, "approve")}
                          className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400">Approve</button>
                        <button onClick={() => handleWithdrawalAction(w.id, "reject", "Insufficient documentation")}
                          className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400">Reject</button>
                      </div>
                    )}
                    {w.status === "APPROVED" && (
                      <button onClick={() => handleWithdrawalAction(w.id, "process")}
                        className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-400">Process</button>
                    )}
                  </td>
                </motion.tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "escrows" && (
        <div className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4"><FiClock className="inline text-[var(--neon-yellow)] mr-2" />Escrow Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-3 px-2">ID</th><th className="text-left py-3 px-2">Amount</th>
                <th className="text-left py-3 px-2">Commission</th><th className="text-left py-3 px-2">Seller Gets</th>
                <th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Date</th>
              </tr></thead>
              <tbody>{escrows.map((e: any) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                  <td className="py-3 px-2 font-mono text-xs text-[var(--neon-cyan)]">{(e.id || "").slice(0, 16)}</td>
                  <td className="py-3 px-2 font-semibold">{formatPrice(e.amount)}</td>
                  <td className="py-3 px-2">{formatPrice(e.commission)}</td>
                  <td className="py-3 px-2">{formatPrice(e.sellerAmount)}</td>
                  <td className="py-3 px-2">
                    <span className={"text-xs px-2 py-1 rounded-full " + (
                      e.status === "RELEASED" ? "bg-green-500/20 text-green-400" :
                      e.status === "HELD" ? "bg-yellow-500/20 text-yellow-400" :
                      e.status === "REFUNDED" ? "bg-red-500/20 text-red-400" :
                      "bg-orange-500/20 text-orange-400")}>{e.status}</span>
                  </td>
                  <td className="py-3 px-2 text-[var(--foreground)]/50">{e.createdAt ? formatDate(e.createdAt) : ""}</td>
                </motion.tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "disputes" && (
        <div className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4"><FiAlertTriangle className="inline text-[var(--neon-yellow)] mr-2" />Disputes</h2>
          {disputes.length === 0 ? <p className="text-[var(--foreground)]/40 text-center py-8">No disputes</p> : (
            <div className="space-y-3">
              {disputes.map((d: any) => (
                <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--card-border)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-[var(--neon-cyan)]">{(d.id || "").slice(0, 12)}</span>
                        <span className={"text-xs px-2 py-0.5 rounded-full " + (
                          d.status === "OPEN" ? "bg-red-500/20 text-red-400" :
                          d.status === "UNDER_REVIEW" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-green-500/20 text-green-400")}>{d.status?.replace(/_/g, " ")}</span>
                      </div>
                      <p className="text-sm font-medium">{d.reason}</p>
                      <p className="text-xs text-[var(--foreground)]/60 mt-1">{d.description}</p>
                      <p className="text-xs text-[var(--foreground)]/40 mt-1">Escrow: {(d.escrowId || "").slice(0, 16)}</p>
                    </div>
                    {d.status === "OPEN" && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleDisputeAction(d.id, "resolve", "RESOLVED_BUYER", "Resolved in favor of buyer - full refund")}
                          className="text-xs px-3 py-1.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">Favor Buyer</button>
                        <button onClick={() => handleDisputeAction(d.id, "resolve", "RESOLVED_SELLER", "Resolved in favor of seller - release payment")}
                          className="text-xs px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">Favor Seller</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4"><FiUsers className="inline text-[var(--neon-cyan)] mr-2" />Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-3 px-2">ID</th><th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Email</th><th className="text-left py-3 px-2">Role</th>
                <th className="text-left py-3 px-2">Status</th>
              </tr></thead>
              <tbody>{users.map((u: any) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                  <td className="py-3 px-2 font-mono text-xs text-[var(--neon-cyan)]">{(u.id || "").slice(0, 12)}</td>
                  <td className="py-3 px-2">{u.name || "N/A"}</td>
                  <td className="py-3 px-2 text-[var(--foreground)]/70">{u.email}</td>
                  <td className="py-3 px-2">
                    <span className={"text-xs px-2 py-1 rounded-full " + (u.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : u.role === "SELLER" ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-500/20 text-blue-400")}>{u.role}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={"text-xs px-2 py-1 rounded-full " + (u.verificationStatus === "VERIFIED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")}>{u.verificationStatus || "UNVERIFIED"}</span>
                  </td>
                </motion.tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="glass rounded-xl p-5 card">
          <h2 className="text-lg font-bold mb-4"><FiShoppingBag className="inline text-[var(--neon-cyan)] mr-2" />All Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-3 px-2">Order</th><th className="text-left py-3 px-2">Buyer</th>
                <th className="text-left py-3 px-2">Seller</th><th className="text-left py-3 px-2">Total</th>
                <th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Payment</th>
                <th className="text-left py-3 px-2">Date</th>
              </tr></thead>
              <tbody>{orders.map((o: any) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5">
                  <td className="py-3 px-2 font-mono text-xs text-[var(--neon-cyan)]">{(o.id || "").slice(0, 12)}</td>
                  <td className="py-3 px-2 text-[var(--foreground)]/70">{(o.customerId || "").slice(0, 12)}</td>
                  <td className="py-3 px-2 text-[var(--foreground)]/70">{(o.sellerId || "").slice(0, 12)}</td>
                  <td className="py-3 px-2 font-semibold">{formatPrice(o.totalPrice)}</td>
                  <td className="py-3 px-2">
                    <span className={"text-xs px-2 py-1 rounded-full " + (
                      o.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                      o.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                      o.status === "CANCELLED" ? "bg-red-500/20 text-red-400" :
                      "bg-blue-500/20 text-blue-400")}>{o.status?.replace(/_/g, " ")}</span>
                  </td>
                  <td className="py-3 px-2 text-[var(--foreground)]/70">{o.paymentStatus || "N/A"}</td>
                  <td className="py-3 px-2 text-[var(--foreground)]/50">{o.createdAt ? formatDate(o.createdAt) : ""}</td>
                </motion.tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
