"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface CategoryCardProps {
  id: string
  name: string
  icon: string
  count: number
  href?: string
}

export default function CategoryCard({ id, name, icon, count, href = `/category/${id.toLowerCase()}` }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      <Link href={href}>
        <div className="card p-6 flex flex-col items-center text-center gap-4 group cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <div className="absolute -inset-x-20 -inset-y-20 gradient-bg opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-500" />

          <motion.div
            whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className="text-4xl"
          >
            {icon}
          </motion.div>

          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--neon-cyan)] transition-colors">
              {name}
            </h3>
            <p className="text-xs text-[var(--foreground)]/50 mt-1">
              {count} {count === 1 ? "Product" : "Products"}
            </p>
          </div>

          <motion.div
            initial={{ width: 0 }}
            whileHover={{ width: "40%" }}
            className="h-0.5 gradient-bg rounded-full"
          />
        </div>
      </Link>
    </motion.div>
  )
}
