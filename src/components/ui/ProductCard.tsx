"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { FiStar, FiShoppingCart, FiHeart } from "react-icons/fi"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  rating?: number
  reviews?: number
  seller?: { name: string }
}

export default function ProductCard({
  id,
  name,
  price,
  images,
  category,
  rating = 0,
  reviews = 0,
  seller,
}: ProductCardProps) {
  const imageUrl = images?.[0] || "/placeholder.svg"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="card group overflow-hidden"
    >
      <Link href={`/product/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--neon-purple)]/80 backdrop-blur-sm text-white">
              {category.replace(/_/g, " ")}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-[var(--foreground)] hover:text-[var(--neon-pink)] transition-colors opacity-0 group-hover:opacity-100"
          >
            <FiHeart size={16} />
          </motion.button>

          {price > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1 rounded-md text-sm font-bold gradient-bg text-white shadow-lg shadow-[var(--primary-glow)]">
                {formatPrice(price)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--neon-cyan)] transition-colors">
            {name}
          </h3>

          {seller && (
            <p className="text-xs text-[var(--foreground)]/50">
              by <span className="text-[var(--foreground)]/70">{seller.name}</span>
            </p>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                size={14}
                className={i < Math.floor(rating) ? "text-[var(--accent)] fill-[var(--accent)]" : "text-[var(--foreground)]/20"}
              />
            ))}
            <span className="text-xs text-[var(--foreground)]/50 ml-1">
              ({reviews})
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 mt-2"
          >
            <FiShoppingCart size={16} />
            Add to Cart
          </motion.button>
        </div>
      </Link>
    </motion.div>
  )
}
