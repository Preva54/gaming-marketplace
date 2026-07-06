"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { motion } from "framer-motion"
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi"

interface ChatInputProps {
  onSend: (message: string) => void
  onAttach: (file: File) => void
  disabled?: boolean
  maxChars?: number
}

export default function ChatInput({ onSend, onAttach, disabled, maxChars = 500 }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const charCount = message.length

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setMessage("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAttach(file)
      e.target.value = ""
    }
  }

  return (
    <div className="glass border-t border-[var(--card-border)] p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) setMessage(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="input-field resize-none pr-12 py-3 min-h-[48px] max-h-[120px]"
            disabled={disabled}
            style={{ height: "auto", overflow: "hidden" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`
            }}
          />
          <span
            className={`absolute bottom-2 right-3 text-[10px] ${
              charCount > maxChars * 0.9 ? "text-red-400" : "text-[var(--foreground)]/40"
            }`}
          >
            {charCount}/{maxChars}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary p-3 rounded-lg"
          type="button"
          disabled={disabled}
        >
          <FiPaperclip size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className="btn-secondary p-3 rounded-lg"
          type="button"
          disabled={disabled}
        >
          <FiSmile size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          className="btn-primary p-3 rounded-lg flex items-center justify-center"
          disabled={disabled || !message.trim()}
          style={{ opacity: !message.trim() ? 0.5 : 1 }}
        >
          <FiSend size={18} />
        </motion.button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
