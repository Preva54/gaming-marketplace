"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiSettings, FiGlobe, FiMail, FiShield, FiDollarSign, FiPercent, FiSave, FiRefreshCw } from "react-icons/fi"
import toast from "react-hot-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminSettingsPage() {
  const [general, setGeneral] = useState({
    siteName: "Nexus Market",
    description: "The Ultimate Gaming Marketplace",
    supportEmail: "support@nexusmarket.com",
    currency: "USD",
    taxRate: "8.5",
    commissionRate: "5",
    minWithdrawal: "10",
    maxWithdrawal: "10000",
    maintenanceMode: false,
    newRegistrations: true,
    sellerVerification: true,
  })

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved!`)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold gradient-text">Admin Settings</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Configure your marketplace platform</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-6 card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white">
            <FiGlobe size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">General Settings</h2>
            <p className="text-sm text-[var(--foreground)]/50">Basic marketplace information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Site Name</label>
            <input type="text" value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Support Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
              <input type="email" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} className="input-field pl-10" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Site Description</label>
            <textarea value={general.description} onChange={(e) => setGeneral({ ...general, description: e.target.value })} className="input-field h-20 resize-none" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSave("General")} className="btn-primary flex items-center gap-2 text-sm">
            <FiSave size={16} /> Save Changes
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-6 card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--neon-yellow)] to-[var(--neon-pink)] flex items-center justify-center text-white">
            <FiDollarSign size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Pricing & Commission</h2>
            <p className="text-sm text-[var(--foreground)]/50">Platform fees and financial settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
              <span className="flex items-center gap-1"><FiPercent size={14} /> Commission Rate (%)</span>
            </label>
            <input type="number" value={general.commissionRate} onChange={(e) => setGeneral({ ...general, commissionRate: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
              <span className="flex items-center gap-1"><FiPercent size={14} /> Tax Rate (%)</span>
            </label>
            <input type="number" value={general.taxRate} onChange={(e) => setGeneral({ ...general, taxRate: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Currency</label>
            <select value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })} className="input-field">
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Min Withdrawal ($)</label>
            <input type="number" value={general.minWithdrawal} onChange={(e) => setGeneral({ ...general, minWithdrawal: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Max Withdrawal ($)</label>
            <input type="number" value={general.maxWithdrawal} onChange={(e) => setGeneral({ ...general, maxWithdrawal: e.target.value })} className="input-field" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSave("Pricing")} className="btn-primary flex items-center gap-2 text-sm">
            <FiSave size={16} /> Save Changes
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-6 card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-pink)] flex items-center justify-center text-white">
            <FiShield size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Platform Controls</h2>
            <p className="text-sm text-[var(--foreground)]/50">Toggle platform features and modes</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "maintenanceMode", label: "Maintenance Mode", desc: "Put the site in maintenance mode. Only admins can access.", danger: true },
            { key: "newRegistrations", label: "Allow New Registrations", desc: "Enable or disable new user account creation." },
            { key: "sellerVerification", label: "Require Seller Verification", desc: "Sellers must verify their identity before listing products." },
          ].map(({ key, label, desc, danger }) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-[var(--primary)]/5">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--foreground)]/50">{desc}</p>
              </div>
              <button
                onClick={() => setGeneral({ ...general, [key]: !(general as any)[key] })}
                className={`relative w-12 h-6 rounded-full transition-colors ${(general as any)[key] ? (danger ? "bg-red-500" : "bg-green-500") : "bg-[var(--primary)]/20"}`}
              >
                <motion.div
                  animate={{ x: (general as any)[key] ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSave("Platform")} className="btn-primary flex items-center gap-2 text-sm">
            <FiSave size={16} /> Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
