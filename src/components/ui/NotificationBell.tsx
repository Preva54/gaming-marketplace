"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiBell } from "react-icons/fi"

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: Date
}

interface NotificationBellProps {
  count?: number
  notifications?: Notification[]
  onMarkRead?: (id: string) => void
  onViewAll?: () => void
}

export default function NotificationBell({
  count = 3,
  notifications = [],
  onMarkRead,
  onViewAll,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
      >
        <FiBell size={22} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--neon-pink)] text-white text-xs flex items-center justify-center font-bold"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 glass rounded-lg border border-[var(--card-border)] shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-[var(--card-border)]">
              <h3 className="text-sm font-semibold gradient-text">Notifications</h3>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--foreground)]/50">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onMarkRead?.(n.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[var(--primary)]/5 transition-colors ${
                      !n.read ? "border-l-2 border-[var(--neon-pink)]" : ""
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.read ? "bg-transparent" : "bg-[var(--neon-pink)]"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)] truncate">{n.message}</p>
                      <p className="text-xs text-[var(--foreground)]/50 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="w-full p-3 text-sm text-[var(--neon-cyan)] hover:bg-[var(--primary)]/5 transition-colors border-t border-[var(--card-border)]"
              >
                View all notifications
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
