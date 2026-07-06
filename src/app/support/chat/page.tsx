"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiMessageCircle, FiX, FiUser, FiCpu, FiShield,
  FiArrowLeft, FiSend, FiPaperclip, FiCopy, FiThumbsUp,
  FiChevronRight, FiRefreshCw,
} from "react-icons/fi"
import Link from "next/link"
import ChatBubble from "@/components/chat/ChatBubble"
import ChatInput from "@/components/chat/ChatInput"

interface ChatMessage {
  id: string
  sender: "user" | "ai" | "admin"
  content: string
  timestamp: Date
  read?: boolean
}

const quickReplies = [
  "Track my order",
  "Refund policy",
  "Account issues",
  "Become a seller",
  "Payment help",
  "Contact human agent",
]

const aiResponses: Record<string, string> = {
  "track my order": "You can track your order by going to Dashboard > Orders. All your active orders will show real-time status updates. Need the specific order ID?",
  "refund policy": "Our refund policy allows returns within 14 days of purchase for most items. Digital products may have different terms. Would you like to start a refund request?",
  "account issues": "I can help with account-related issues! Common solutions include password reset, email verification, and two-factor authentication setup. What specific issue are you facing?",
  "become a seller": "Great that you're interested in selling! Go to Settings > Become a Seller. You'll need to complete identity verification and set up your payment method. The process takes about 24 hours.",
  "payment help": "We accept all major credit cards, PayPal, and cryptocurrency. All payments are processed securely through Stripe. What payment issue are you experiencing?",
  "contact human agent": "I'll transfer you to a human support agent right away. Please hold while I connect you to the next available representative.",
}

function generateAIResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(aiResponses)) {
    if (lower.includes(key)) return response
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! Welcome to Nexus Market Support. How can I assist you today? You can ask about orders, refunds, account issues, or anything else."
  }
  if (lower.includes("thank")) {
    return "You're welcome! Is there anything else I can help you with?"
  }
  if (lower.includes("bye") || lower.includes("goodbye")) {
    return "Goodbye! Feel free to come back anytime you need assistance. Have a great day!"
  }
  return "I understand you need help. Let me look into that for you. Could you provide more details so I can assist you better?"
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      content: "Hello! I'm Nexus Support AI. How can I help you today? You can ask about orders, refunds, account issues, or type a custom message.",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isHumanTransfer, setIsHumanTransfer] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content,
      timestamp: new Date(),
      read: true,
    }
    setMessages((prev) => [...prev, userMessage])
    setConversationHistory((prev) => [...prev, { role: "user", content }])
    setShowSuggestions(false)

    if (content.toLowerCase().includes("contact human agent") || content.toLowerCase().includes("human")) {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setIsHumanTransfer(true)
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: "I'm transferring you to a human support agent. Please wait while I connect you...",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setTimeout(() => {
          const adminMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            sender: "admin",
            content: "Hello! This is Alex from Support. I'll be taking over from here. How can I assist you today?",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, adminMessage])
        }, 2000)
      }, 1500)
      return
    }

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const response = generateAIResponse(content)
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setConversationHistory((prev) => [...prev, { role: "assistant", content: response }])
    }, 1000 + Math.random() * 1000)
  }

  const handleAttach = (file: File) => {
    const message = `[Attachment: ${file.name}]`
    handleSend(message)
  }

  const handleQuickReply = (text: string) => {
    handleSend(text)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/support" className="inline-flex items-center gap-2 text-sm text-[var(--neon-cyan)] hover:underline mb-4">
            <FiArrowLeft size={16} />
            Back to Support Center
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
              <FiMessageCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Nexus Support Chat</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse-glow" />
                <span className="text-xs text-[var(--foreground)]/60">
                  {isHumanTransfer ? "Connected to human agent" : "AI Assistant Online"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}
        >
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-xl p-4 border border-[var(--card-border)] mb-4"
                >
                  <p className="text-xs text-[var(--foreground)]/60 mb-3">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs px-3 py-1.5 rounded-full glass border border-[var(--card-border)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-all"
                      >
                        {reply}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                content={msg.content}
                timestamp={msg.timestamp}
                read={msg.read}
                name={
                  msg.sender === "ai" ? "Nexus AI" :
                  msg.sender === "admin" ? "Alex (Support)" :
                  undefined
                }
              />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--neon-cyan)]/20 flex items-center justify-center">
                  <FiCpu className="text-[var(--neon-cyan)]" size={16} />
                </div>
                <div className="glass rounded-2xl px-4 py-3 border border-[var(--neon-cyan)]/30">
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-[var(--neon-cyan)]"
                    />
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-[var(--neon-cyan)]"
                    />
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-[var(--neon-cyan)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={handleSend} onAttach={handleAttach} maxChars={500} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--foreground)]/40"
        >
          <span>Chat is encrypted</span>
          <span>&middot;</span>
          <span>Messages are not stored permanently</span>
          <span>&middot;</span>
          <span>Responses are AI-generated</span>
        </motion.div>
      </div>
    </div>
  )
}
