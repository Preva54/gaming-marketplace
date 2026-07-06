"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { FiSearch, FiChevronDown, FiMessageCircle } from "react-icons/fi"

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

const FAQ_CATEGORIES = ["All", "Orders", "Payments", "Accounts", "Sellers", "Support"]

const FAQ_DATA: FAQItem[] = [
  { id: "1", category: "Orders", question: "How long does delivery take?", answer: "Most digital products are delivered instantly after payment confirmation. In some cases, it may take up to 24 hours for manual delivery of high-value items." },
  { id: "2", category: "Orders", question: "Can I cancel my order?", answer: "Orders can be cancelled within 30 minutes of purchase if the product hasn't been delivered yet. Contact support for assistance." },
  { id: "3", category: "Orders", question: "How do I track my order?", answer: "You can track all your orders in the Orders section of your profile. Each order has a status indicator and delivery information." },
  { id: "4", category: "Payments", question: "What payment methods do you accept?", answer: "We accept Credit/Debit cards (Visa, Mastercard, Amex), PayPal, and cryptocurrency (BTC, ETH). All payments are processed securely." },
  { id: "5", category: "Payments", question: "Is my payment information safe?", answer: "Yes, we use industry-standard SSL encryption and never store your full card details. Our payment processing is PCI-DSS compliant." },
  { id: "6", category: "Payments", question: "How do refunds work?", answer: "Refunds are processed within 3-5 business days to your original payment method. Each refund request is reviewed by our team." },
  { id: "7", category: "Accounts", question: "Do I need an account to buy?", answer: "Yes, you need to create an account to make purchases. This helps us protect both buyers and sellers and track order history." },
  { id: "8", category: "Accounts", question: "How do I verify my account?", answer: "Account verification can be done by providing a valid ID and proof of address. Verified accounts get higher purchase limits." },
  { id: "9", category: "Accounts", question: "Can I delete my account?", answer: "Yes, you can delete your account from the Settings page. All personal data will be removed within 30 days." },
  { id: "10", category: "Sellers", question: "How do I become a seller?", answer: "Anyone can apply to become a seller. You'll need to verify your identity and agree to our seller terms. Applications are reviewed within 48 hours." },
  { id: "11", category: "Sellers", question: "What are the seller fees?", answer: "We charge a 5% commission on all sales. Premium sellers with high ratings get reduced fees starting at 3%." },
  { id: "12", category: "Sellers", question: "How do I get paid as a seller?", answer: "Payouts are processed weekly via PayPal, bank transfer, or cryptocurrency. Minimum payout is $50." },
  { id: "13", category: "Support", question: "How do I contact support?", answer: "You can reach us via live chat, email at support@gamemarket.com, or submit a ticket through the contact page." },
  { id: "14", category: "Support", question: "What are your support hours?", answer: "Our support team is available 24/7 via live chat. Email responses are typically within 2-4 hours." },
]

export default function FAQPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = FAQ_DATA.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "All" || faq.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg mb-6 max-w-xl mx-auto">
            Find answers to common questions about our marketplace
          </p>
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12 pr-4 py-3"
            />
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? "gradient-bg text-white"
                  : "glass text-gray-400 hover:border-purple-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No questions found. Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                  className="w-full p-4 md:p-5 flex items-center gap-3 text-left"
                >
                  <span className="w-2 h-2 rounded-full gradient-bg shrink-0" />
                  <span className="flex-1 font-medium text-sm md:text-base">{faq.question}</span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full hidden sm:inline">
                    {faq.category}
                  </span>
                  <FiChevronDown
                    className={`text-gray-400 shrink-0 transition-transform ${
                      expanded === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expanded === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-purple-500/20 pt-3">
                        <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center mt-12"
        >
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-gray-400 mb-6">Our support team is ready to help you 24/7</p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            <FiMessageCircle /> Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
