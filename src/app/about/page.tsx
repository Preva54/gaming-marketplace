"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

function Counter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-1">
        {value.toLocaleString()}{suffix}
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  )
}

const TEAM = [
  { name: "Alex Storm", role: "CEO & Founder", avatar: "AS", color: "from-purple-500 to-pink-500" },
  { name: "Sarah Blade", role: "CTO", avatar: "SB", color: "from-cyan-500 to-blue-500" },
  { name: "Mike Shadow", role: "Head of Operations", avatar: "MS", color: "from-yellow-500 to-orange-500" },
  { name: "Luna Night", role: "Community Manager", avatar: "LN", color: "from-green-500 to-teal-500" },
]

const VALUES = [
  { icon: "🛡️", title: "Trust & Security", desc: "Every transaction is protected. We verify all sellers and products." },
  { icon: "⚡", title: "Instant Delivery", desc: "Get your digital goods instantly after purchase confirmation." },
  { icon: "💬", title: "24/7 Support", desc: "Our gaming experts are always ready to help you." },
  { icon: "🎯", title: "Best Prices", desc: "Competitive pricing guaranteed across all categories." },
]

export default function AboutPage() {
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" })

  return (
    <div className="min-h-screen">
      <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--neon-purple)_0%,_transparent_70%)] opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10 px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4">
            About GameMarket
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            The ultimate marketplace for gamers, by gamers. We connect buyers and sellers
            in the most trusted digital gaming marketplace.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 md:p-12 mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 gradient-text">Our Story</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed max-w-4xl">
            <p>
              Founded in 2020, GameMarket was born from a simple idea: make buying and
              selling digital gaming goods safe, fast, and fair. What started as a small
              community of gamers trading accounts has grown into a global marketplace
              serving thousands of customers daily.
            </p>
            <p>
              We&apos;ve built a platform where gamers can confidently buy accounts, gift cards,
              game keys, and digital currencies. Every seller is verified, every product is
              vetted, and every transaction is protected by our buyer protection guarantee.
            </p>
            <p>
              Our team of passionate gamers works around the clock to ensure you get the
              best deals with instant delivery. Whether you&apos;re looking for a ranked account,
              rare skins, or the latest game keys, GameMarket is your one-stop shop.
            </p>
          </div>
        </motion.div>

        <div ref={statsRef} className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">GameMarket by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsInView && (
              <>
                {[
                  { value: 5, label: "Years of Service", suffix: "+" },
                  { value: 500000, label: "Happy Gamers", suffix: "+" },
                  { value: 1500000, label: "Transactions", suffix: "+" },
                  { value: 5000, label: "Trusted Sellers", suffix: "+" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-xl p-4"
                  >
                    <Counter {...stat} />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <div key={value.title} className="glass rounded-xl p-6 text-center card">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="glass rounded-xl p-6 text-center card">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-2xl font-bold mx-auto mb-4`}
                >
                  {member.avatar}
                </div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
