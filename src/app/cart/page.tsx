"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiTag, FiArrowLeft, FiHeart } from "react-icons/fi"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/utils"
import toast from "react-hot-toast"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore()
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [savedForLater, setSavedForLater] = useState<string[]>([])

  const subtotal = totalPrice()
  const discount = promoApplied ? subtotal * 0.1 : 0
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal - discount + shipping

  const handleApplyPromo = async () => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      })
      if (res.ok) {
        setPromoApplied(true)
        toast.success("Promo code applied! 10% off!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Invalid promo code")
      }
    } catch {
      toast.error("Failed to validate promo code")
    }
  }

  const handleSaveForLater = (productId: string) => {
    setSavedForLater((prev) => [...prev, productId])
    removeItem(productId)
    toast.success("Saved for later")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-8xl mb-6 animate-float">🛒</div>
          <h2 className="text-3xl font-bold gradient-text mb-3">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-8">
            Looks like you haven&apos;t added any gaming goods yet!
          </p>
          <Link href="/marketplace" className="btn-primary inline-flex items-center gap-2">
            <FiArrowLeft /> Browse Marketplace
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8 flex items-center gap-3">
            <FiShoppingCart /> Shopping Cart ({items.length})
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-4 md:p-6 flex gap-4"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl gradient-bg flex items-center justify-center text-4xl shrink-0">
                  🎮
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
                  <p className="text-lg font-bold gradient-text mt-1">{formatPrice(item.price)}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 glass rounded-lg p-1">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeItem(item.productId)
                            } else {
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                          }}
                          className="p-1.5 hover:text-purple-400 transition-colors"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:text-purple-400 transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleSaveForLater(item.productId)}
                        className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                      >
                        <FiHeart size={12} /> Save
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => {
                          removeItem(item.productId)
                          toast.success("Item removed")
                        }}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {savedForLater.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiHeart className="text-purple-400" /> Saved for Later
                </h3>
                <p className="text-sm text-gray-500">
                  {savedForLater.length} item(s) saved.{" "}
                  <button
                    onClick={() => {
                      setSavedForLater([])
                      toast.success("Cleared saved items")
                    }}
                    className="text-purple-400 hover:underline"
                  >
                    Clear
                  </button>
                </p>
              </div>
            )}

            <button
              onClick={() => {
                clearCart()
                toast.success("Cart cleared")
              }}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors mt-4"
            >
              Clear Cart
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 space-y-4 sticky top-24">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount (10%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-purple-500/20 pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="input-field flex-1 text-sm"
                />
                <button onClick={handleApplyPromo} className="btn-secondary !px-4 !py-2 text-sm">
                  <FiTag />
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs text-green-400">✓ GAMER10 applied - 10% off!</p>
              )}

              <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
                Proceed to Checkout
              </Link>

              <Link
                href="/marketplace"
                className="block text-center text-sm text-gray-500 hover:text-purple-400 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
