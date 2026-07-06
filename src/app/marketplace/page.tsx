"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { FiSearch, FiHeart, FiShoppingCart, FiChevronDown } from "react-icons/fi"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import { formatPrice, truncate, generateId } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"
import toast from "react-hot-toast"
import type { ProductCategory } from "@/types"

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Popular", value: "popular" },
]

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "ALL">("ALL")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showSort, setShowSort] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const PER_PAGE = 8

  const filtered = useMemo(() => {
    let result = [...products]
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "popular":
        result.sort((a, b) => (b.stock || 0) - (a.stock || 0))
        break
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return result
  }, [selectedCategory, search, sort, products])

  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore = paginated.length < filtered.length

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: "",
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 md:p-16 mb-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 pointer-events-none" />
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4 relative z-10">
            Game On, Level Up
          </h1>
          <p className="text-lg text-gray-400 mb-6 relative z-10">
            Premium gaming accounts, gift cards, and digital goods
          </p>
          <div className="relative max-w-xl mx-auto z-10">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search for accounts, cards, keys..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="input-field pl-12 pr-4 py-4 text-lg"
            />
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory("ALL")
                setPage(1)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "ALL"
                  ? "gradient-bg text-white"
                  : "glass text-gray-300 hover:border-purple-500"
              }`}
            >
              All
            </button>
            {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === key
                      ? "gradient-bg text-white"
                      : "glass text-gray-300 hover:border-purple-500"
                  }`}
                >
                  {CATEGORY_ICONS[key]} {label}
                </button>
              )
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="glass px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <FiChevronDown />
            </button>
            {showSort && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSort(false)}
                />
                <div className="absolute right-0 top-full mt-2 glass rounded-xl p-2 z-20 min-w-[200px]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value)
                        setShowSort(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        sort === option.value
                          ? "gradient-bg text-white"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl text-gray-400">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {paginated.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="card group relative overflow-hidden"
              >
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <FiHeart
                    className={`text-lg ${
                      wishlist.includes(product.id)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                <a href={`/product/${product.id}`}>
                  <div className="aspect-square gradient-bg flex items-center justify-center text-5xl opacity-80 group-hover:opacity-100 transition-opacity">
                    🎮
                  </div>
                </a>

                <div className="p-4">
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 mb-2">
                    {CATEGORY_ICONS[product.category as ProductCategory]}{" "}
                    {CATEGORY_LABELS[product.category as ProductCategory]}
                  </span>

                  <a href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm md:text-base mb-1 hover:text-purple-300 transition-colors">
                      {truncate(product.name, 30)}
                    </h3>
                  </a>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {truncate(product.description, 60)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold gradient-text">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary !p-2 !rounded-lg text-sm flex items-center gap-1"
                    >
                      <FiShoppingCart />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary px-8 py-3"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
