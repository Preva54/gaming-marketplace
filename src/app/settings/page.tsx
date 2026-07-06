"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiUser, FiBell, FiShield, FiLock, FiLink, FiTrash2, FiToggleLeft, FiEye, FiEyeOff, FiSmartphone } from "react-icons/fi"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    orderUpdates: true,
    promotions: true,
  })

  const [twoFactor, setTwoFactor] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profile", icon: <FiUser /> },
    { id: "notifications", label: "Notifications", icon: <FiBell /> },
    { id: "security", label: "Security", icon: <FiShield /> },
    { id: "connections", label: "Connections", icon: <FiLink /> },
  ]

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match")
      return
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    toast.success("Password changed successfully!")
    setPasswords({ current: "", new: "", confirm: "" })
  }

  const handleDeleteAccount = () => {
    setDeleting(true)
    setTimeout(() => {
      toast.error("Account deletion requested. Check your email to confirm.")
      setDeleting(false)
    }, 1500)
  }

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Display Name</label>
                <input type="text" defaultValue="John Gamer" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input type="email" defaultValue="john@gamer.com" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Username</label>
                <input type="text" defaultValue="john_gamer" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Location</label>
                <input type="text" defaultValue="United States" className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Bio</label>
              <textarea className="input-field resize-none" rows={3} defaultValue="Passionate gamer and collector." />
            </div>
            <button className="btn-primary !py-2 !px-6 !text-sm">Save Changes</button>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-4">
            {[
              { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
              { key: "sms", label: "SMS Notifications", desc: "Text message alerts" },
              { key: "orderUpdates", label: "Order Updates", desc: "Get notified about order status" },
              { key: "promotions", label: "Promotions & Deals", desc: "Sales, discounts, and special offers" },
              { key: "marketing", label: "Marketing", desc: "News and updates about new features" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-purple-500/10 last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev],
                    }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notifications[item.key as keyof typeof notifications]
                      ? "gradient-bg"
                      : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications[item.key as keyof typeof notifications]
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )

      case "security":
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiLock /> Change Password
              </h3>
              <div className="space-y-3 max-w-md">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="input-field pr-10"
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="input-field pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="input-field"
                />
                <button onClick={handleChangePassword} className="btn-primary !py-2 !px-6 !text-sm">
                  Update Password
                </button>
              </div>
            </div>

            <div className="border-t border-purple-500/20 pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiSmartphone /> Two-Factor Authentication
              </h3>
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium">Enable 2FA</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => {
                    setTwoFactor(!twoFactor)
                    toast.success(twoFactor ? "2FA disabled" : "2FA enabled")
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    twoFactor ? "gradient-bg" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      twoFactor ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )

      case "connections":
        return (
          <div className="space-y-4">
            {[
              { name: "Google", icon: "G", connected: true, color: "from-yellow-500 to-red-500" },
              { name: "Discord", icon: "D", connected: true, color: "from-indigo-500 to-purple-500" },
              { name: "Steam", icon: "S", connected: false, color: "from-blue-500 to-cyan-500" },
              { name: "Twitch", icon: "T", connected: false, color: "from-purple-500 to-pink-500" },
            ].map((account) => (
              <div
                key={account.name}
                className="flex items-center justify-between py-4 border-b border-purple-500/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${account.color} flex items-center justify-center font-bold text-sm`}
                  >
                    {account.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-gray-500">
                      {account.connected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    toast.success(
                      account.connected
                        ? `${account.name} disconnected`
                        : `Connecting to ${account.name}...`
                    )
                  }
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    account.connected
                      ? "glass text-gray-400 hover:border-red-500 hover:text-red-400"
                      : "gradient-bg text-white"
                  }`}
                >
                  {account.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Settings</h1>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="glass rounded-xl p-2 space-y-1 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "gradient-bg text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 md:p-8"
            >
              {renderTab()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 md:p-8 mt-6 border-red-500/20"
            >
              <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                <FiTrash2 /> Danger Zone
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-6 py-2 rounded-lg text-sm font-medium border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {deleting ? "Processing..." : "Delete Account"}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
