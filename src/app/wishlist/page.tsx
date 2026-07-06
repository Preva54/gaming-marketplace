"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FiHeart, FiShoppingCart, FiTrash2, FiLoader } from "react-icons/fi"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import { formatPrice, truncate } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"
import toast from "react-hot-toast"
import type { ProductCategory } from "@/types"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setWishlist(data))
      .catch(() => toast.error("Failed to load wishlist"))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setWishlist((prev) => prev.filter((p) => p.id !== id))
      toast.success("Removed from wishlist")
    } catch {
      toast.error("Failed to remove")
    }
  }

  const handleAddToCart = async (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: "",
    })
    toast.success(`${product.name} added to cart!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-4xl text-purple-500" />
      </div>
    )
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
          <Link href="/marketplace" className="btn-primary inline-flex items-center gap-2">
            Explore Products
          </Link>
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

              <Link href={`/product/${product.id}`}>
                <div className="aspect-square gradient-bg flex items-center justify-center text-5xl opacity-80 group-hover:opacity-100 transition-opacity">
                  {CATEGORY_ICONS[product.category as ProductCategory]}
                </div>
              </Link>

              <div className="p-4">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 mb-2">
                  {CATEGORY_LABELS[product.category as ProductCategory]}
                </span>

                <Link href={`/product/${product.id}`}>
                  <h3 className="font-semibold text-sm md:text-base mb-1 hover:text-purple-300 transition-colors">
                    {truncate(product.name, 30)}
                  </h3>
                </Link>

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
