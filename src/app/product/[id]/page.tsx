"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import { formatPrice, generateId } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"
import toast from "react-hot-toast"
import type { ProductCategory } from "@/types"

const THUMBNAIL_COLORS = [
  "from-purple-600 to-pink-600",
  "from-cyan-600 to-blue-600",
  "from-yellow-600 to-orange-600",
  "from-green-600 to-teal-600",
  "from-red-600 to-rose-600",
]

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/products/${id}`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then(setProduct)
        .catch(() => setProduct(null))

      fetch(`/api/reviews?productId=${id}`)
        .then(r => r.ok ? r.json() : { reviews: [] })
        .then(data => {
          const reviews = data.reviews || []
          setReviewCount(reviews.length)
          if (reviews.length > 0) {
            const avg = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
            setReviewRating(avg)
          }
        })
        .catch(() => {})

      setLoading(false)
    })
  }, [params])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>
  if (!product) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><h2 className="text-2xl font-bold">Product not found</h2><p className="text-gray-400 mt-2">This product doesn't exist or has been removed.</p></div></div>

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: "",
    })
    toast.success(`Added ${quantity} item(s) to cart!`)
  }

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: "",
    })
    router.push("/checkout")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
      />
    ))
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="glass rounded-2xl overflow-hidden">
              <div
                className={`aspect-square bg-gradient-to-br ${THUMBNAIL_COLORS[currentImage]} flex items-center justify-center text-8xl`}
              >
                🎮
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {THUMBNAIL_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl border-2 transition-all ${
                    currentImage === i ? "border-purple-500 shadow-lg shadow-purple-500/30" : "border-transparent opacity-60"
                  }`}
                >
                  🎮
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-300 mb-3">
                {CATEGORY_ICONS[product.category as ProductCategory]} {CATEGORY_LABELS[product.category as ProductCategory]}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-lg">
                {renderStars(reviewRating)}
              </div>
              <span className="text-gray-400 text-sm">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
            </div>

            <p className="text-gray-400 leading-relaxed">{product.description}</p>

            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold">
                {product.seller?.name?.[0] || "S"}
              </div>
              <div>
                <p className="font-semibold text-sm">{product.seller?.name || "Seller"}</p>
                <span className="text-xs text-green-400">✓ Verified Seller</span>
              </div>
            </div>

            <div className="text-4xl font-bold gradient-text">
              {formatPrice(product.price)}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400">Quantity:</span>
              <div className="flex items-center gap-3 glass rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:text-purple-400 transition-colors"
                >
                  <FiMinus />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:text-purple-400 transition-colors"
                >
                  <FiPlus />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {product.stock} in stock
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FiShoppingCart /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                Buy Now
              </button>
              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted)
                  toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!")
                }}
                className={`btn-secondary !p-3 ${isWishlisted ? "text-red-500 border-red-500" : ""}`}
              >
                <FiHeart className={isWishlisted ? "fill-red-500" : ""} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success("Link copied!")
                }}
                className="btn-secondary !p-3"
              >
                <FiShare2 />
              </button>
            </div>
          </div>
        </motion.div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            Customer Reviews
          </h2>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <p className="text-gray-500 text-sm col-span-full">No related products.</p>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden glass border-t border-purple-500/20 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold gradient-text">{formatPrice(product.price)}</p>
            <p className="text-xs text-gray-500">{product.stock} in stock</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 glass rounded-lg p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 hover:text-purple-400"><FiMinus size={14} /></button>
              <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-1.5 hover:text-purple-400"><FiPlus size={14} /></button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary !p-2.5 !text-sm">
              <FiShoppingCart />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
