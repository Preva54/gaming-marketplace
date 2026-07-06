'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiCreditCard, FiLock, FiCheck, FiArrowLeft, FiTag, FiDollarSign, FiShield } from "react-icons/fi"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

type PaymentMethod = "wallet" | "credit-card" | "paypal"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()
  const [hydrated, setHydrated] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)

  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useCartStore.persist.hasHydrated())
    fetch("/api/wallet").then(r => r.ok ? r.json() : { availableBalance: 0 }).then(w => setWalletBalance(w.availableBalance || 0))
    return () => unsub()
  }, [])

  const [billing, setBilling] = useState({ name: "", email: "", address: "", city: "", zip: "", country: "US" })

  const subtotal = totalPrice()
  const discount = promoApplied ? subtotal * 0.1 : 0
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + shipping + tax

  const handleApplyPromo = async () => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      })
      if (res.ok) {
        setPromoApplied(true)
        toast.success("10% off!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Invalid promo code")
      }
    } catch {
      toast.error("Failed to validate promo code")
    }
  }

  const handlePlaceOrder = async () => {
    if (!billing.name || !billing.email || !billing.address) { toast.error("Fill in billing info"); return }
    if (paymentMethod === "wallet" && walletBalance < total) { toast.error("Insufficient wallet balance"); return }
    setProcessing(true)

    try {
      for (const item of items) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity, promoCode: promoApplied ? "GAMER10" : undefined }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Order failed") }
      }
      clearCart()
      setOrderPlaced(true)
      toast.success("Order placed! Payment held in escrow.")
    } catch (e: any) {
      toast.error(e.message || "Order failed")
    }
    setProcessing(false)
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-3">Order Confirmed!</h2>
          <p className="text-gray-400 mb-2">Your order has been placed. Payment is held securely in escrow.</p>
          <p className="text-sm text-gray-500 mb-8">The seller will be paid once you confirm delivery.</p>
          <Link href="/orders" className="btn-primary inline-flex items-center gap-2">View My Orders</Link>
        </motion.div>
      </div>
    )
  }

  if (hydrated && items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold gradient-text mb-3">Your cart is empty</h2>
          <Link href="/marketplace" className="btn-primary inline-flex items-center gap-2"><FiArrowLeft /> Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Checkout</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiCreditCard /> Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {(["wallet", "credit-card", "paypal"] as PaymentMethod[]).map((m) => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={"p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-sm " + (
                      paymentMethod === m ? "border-purple-500 bg-purple-500/10" : "border-gray-700 hover:border-gray-500")}>
                    {m === "wallet" ? <FiDollarSign className="text-lg" /> : m === "credit-card" ? <FiCreditCard className="text-lg" /> : <FiDollarSign className="text-lg" />}
                    <span>{m === "wallet" ? "Wallet ($" + (walletBalance || 0).toFixed(2) + ")" : m === "credit-card" ? "Card" : "PayPal"}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === "wallet" && walletBalance < total && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                  Insufficient balance. Please <Link href="/wallet" className="underline">add funds</Link>.
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Billing Information</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name" value={billing.name} onChange={e => setBilling({ ...billing, name: e.target.value })} className="input-field" />
                  <input type="email" placeholder="Email" value={billing.email} onChange={e => setBilling({ ...billing, email: e.target.value })} className="input-field" />
                </div>
                <input type="text" placeholder="Address" value={billing.address} onChange={e => setBilling({ ...billing, address: e.target.value })} className="input-field" />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="City" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} className="input-field" />
                  <input type="text" placeholder="ZIP Code" value={billing.zip} onChange={e => setBilling({ ...billing, zip: e.target.value })} className="input-field" />
                  <select value={billing.country} onChange={e => setBilling({ ...billing, country: e.target.value })} className="input-field">
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><FiLock /> Secure Escrow</h2>
              <div className="space-y-3 text-sm text-[var(--foreground)]/70">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">1</div>
                  <p>You purchase the product. Payment is held securely by the platform.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">2</div>
                  <p>Seller fulfills the order and delivers the product.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">3</div>
                  <p>You confirm delivery. Funds are released to the seller (minus platform commission).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">4</div>
                  <p>Auto-completes after 3 days if no dispute is opened.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 space-y-4 sticky top-24">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-lg shrink-0">🎮</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm pt-2 border-t border-purple-500/20">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="border-t border-purple-500/20 pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="input-field flex-1 text-sm" />
                <button onClick={handleApplyPromo} className="btn-secondary !px-3 !py-2 text-sm"><FiTag /></button>
              </div>
              {promoApplied && <p className="text-xs text-green-400">✓ GAMER10 applied</p>}
              <button onClick={handlePlaceOrder} disabled={processing}
                className="btn-primary w-full flex items-center justify-center gap-2 !py-3 disabled:opacity-50">
                {processing ? "Processing..." : <><FiLock /> Pay {formatPrice(total)}</>}
              </button>
              <p className="text-xs text-gray-500 text-center">Escrow protected. No risk to buyer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
