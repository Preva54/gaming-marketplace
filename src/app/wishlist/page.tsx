"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import { formatPrice, truncate } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"
import toast from "react-hot-toast"
import type { ProductCategory } from "@/types"

const MOCK_WISHLIST = Array.from({ length: 8 }, (_, i) => ({
  id: `wish-${i + 1}`,
  category: Object.keys(CATEGORY_LABELS)[i % 8] as ProductCategory,
  name: ["Radiant Valorant Account", "Steam Wallet $100", "5000 V-Bucks Pack", "League Challenger Account", "Netflix Gift Card 1yr", "CS2 Prime Account", "Xbox Game Pass Ultimate", "Fortnite Cosmetic Pack"][i],
  description: "Premium digital product",
  price: [249.99, 95.0, 39.99, 189.99, 149.99, 59.99, 44.99, 29.99][i],
  sellerId: "seller-1",
  availability: true,
  stock: 5,
  featured: false,
  createdAt: new Date(),
}))

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(MOCK_WISHLIST)
  const addItem = useCartStore((s) => s.addItem)

  const handleRemove = (id: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id))
    toast.success("Removed from wishlist")
  }

  const handleAddToCart = (product: (typeof MOCK_WISHLIST)[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: "",
    })
    toast.success(`${product.name} added to cart!`)
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-8xl mb-6 animate-float">💔</div>
          <h2 className="text-3xl font-bold gradient-text mb-3">Your Wishlist is Empty</h2>
          <p className="text-gray-400 mb-8">
            Save items you love to your wishlist and come back anytime!
          </p>
          <a href="/marketplace" className="btn-primary inline-flex items-center gap-2">
            Explore Products
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text flex items-center gap-3">
            <FiHeart className="text-red-500" /> My Wishlist ({wishlist.length})
          </h1>
          <button
            onClick={() => {
              setWishlist([])
              toast.success("Wishlist cleared")
            }}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {wishlist.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="card group relative overflow-hidden"
            >
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-red-500/50 transition-colors"
              >
                <FiTrash2 className="text-red-400 text-lg" />
              </button>

              <a href={`/product/${product.id}`}>
                <div className="aspect-square gradient-bg flex items-center justify-center text-5xl opacity-80 group-hover:opacity-100 transition-opacity">
                  {CATEGORY_ICONS[product.category]}
                </div>
              </a>

              <div className="p-4">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 mb-2">
                  {CATEGORY_LABELS[product.category]}
                </span>

                <a href={`/product/${product.id}`}>
                  <h3 className="font-semibold text-sm md:text-base mb-1 hover:text-purple-300 transition-colors">
                    {truncate(product.name, 30)}
                  </h3>
                </a>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold gradient-text">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary !p-2 !rounded-lg text-sm"
                  >
                    <FiShoppingCart />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
