"use client"

import { motion } from "framer-motion"
import { FiUser, FiCpu, FiShield, FiPaperclip, FiCheck, FiCheckCircle } from "react-icons/fi"

interface ChatBubbleProps {
  sender: "user" | "ai" | "admin"
  content: string
  timestamp: Date
  read?: boolean
  attachments?: string[]
  avatar?: string | null
  name?: string
}

export default function ChatBubble({
  sender,
  content,
  timestamp,
  read,
  attachments,
  avatar,
  name,
}: ChatBubbleProps) {
  const isUser = sender === "user"
  const isAI = sender === "ai"

  const avatarIcon = isAI ? (
    <FiCpu className="text-[var(--neon-cyan)]" size={18} />
  ) : isUser ? (
    <FiUser className="text-[var(--neon-purple)]" size={18} />
  ) : (
    <FiShield className="text-[var(--neon-yellow)]" size={18} />
  )

  const avatarBg = isAI
    ? "bg-[var(--neon-cyan)]/20"
    : isUser
    ? "bg-[var(--neon-purple)]/20"
    : "bg-[var(--neon-yellow)]/20"

  const bubbleBg = isAI
    ? "bg-[var(--neon-cyan)]/10 border-[var(--neon-cyan)]/30"
    : isUser
    ? "bg-[var(--neon-purple)]/20 border-[var(--neon-purple)]/30"
    : "bg-[var(--neon-yellow)]/10 border-[var(--neon-yellow)]/30"

  const bubbleAlign = isUser ? "items-end" : "items-start"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col gap-1 ${bubbleAlign} max-w-[80%] ${isUser ? "ml-auto" : "mr-auto"}`}
    >
      {name && (
        <span className={`text-xs px-1 ${isUser ? "text-right" : "text-left"} text-[var(--foreground)]/60`}>
          {name}
        </span>
      )}
      <div className="flex gap-2 items-end">
        {!isUser && (
          <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
            {avatarIcon}
          </div>
        )}
        <div
          className={`glass rounded-2xl px-4 py-3 border ${bubbleBg} ${
            isUser ? "rounded-br-md" : "rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          {attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[var(--neon-cyan)] hover:underline"
                >
                  <FiPaperclip size={12} />
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          )}
          <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] text-[var(--foreground)]/40">
              {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isUser && (
              <span className="text-[10px]">
                {read ? (
                  <FiCheckCircle className="text-[var(--neon-cyan)]" size={12} />
                ) : (
                  <FiCheck className="text-[var(--foreground)]/40" size={12} />
                )}
              </span>
            )}
          </div>
        </div>
        {isUser && (
          <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
            {avatarIcon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
