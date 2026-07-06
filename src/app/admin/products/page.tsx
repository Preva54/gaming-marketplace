"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiPackage, FiSearch, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus, FiX } from "react-icons/fi"
import { formatPrice, formatDate } from "@/lib/utils"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types"
import type { ProductCategory } from "@/types"
import toast from "react-hot-toast"

interface AdminProduct {
  id: string
  name: string
  category: ProductCategory
  price: number
  stock: number
  seller: string
  featured: boolean
  availability: boolean
  createdAt: Date
}



const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      const items = (Array.isArray(data) ? data : data.products ?? []).map((p: any) => ({
        ...p,
        seller: typeof p.seller === "object" && p.seller ? p.seller.name : p.seller,
        createdAt: new Date(p.createdAt),
      }))
      setProducts(items)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "ALL">("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "GAMING_ACCOUNTS" as ProductCategory,
    price: "",
    stock: "",
    seller: "",
    image: "",
  })
  const perPage = 8

  const filtered = useMemo(() => {
    let result = products
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q))
    }
    if (categoryFilter !== "ALL") result = result.filter((p) => p.category === categoryFilter)
    return result
  }, [products, search, categoryFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const toggleFeatured = async (id: string) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !product.featured }) })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)))
      toast.success("Featured status updated")
    } catch { toast.error("Failed to update featured status") }
  }
  const toggleAvailability = async (id: string) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availability: !product.availability }) })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, availability: !p.availability } : p)))
      toast.success("Availability updated")
    } catch { toast.error("Failed to update availability") }
  }
  const removeProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success("Product deleted")
    } catch { toast.error("Failed to delete product") }
  }

  const handleEdit = (product: AdminProduct) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      seller: product.seller,
      image: "",
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const stats = {
    total: products.length,
    active: products.filter((p) => p.availability).length,
    featured: products.filter((p) => p.featured).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  }

  const categories = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Product Management</h1>
          <p className="text-[var(--foreground)]/60 mt-1">{filtered.length} of {products.length} products</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Add Product
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: stats.total, icon: <FiPackage />, color: "from-[var(--neon-purple)] to-[var(--neon-cyan)]" },
          { label: "Active", value: stats.active, icon: <FiPackage />, color: "from-green-400 to-teal-400" },
          { label: "Featured", value: stats.featured, icon: <FiPackage />, color: "from-[var(--neon-yellow)] to-[var(--neon-pink)]" },
          { label: "Out of Stock", value: stats.outOfStock, icon: <FiPackage />, color: "from-red-400 to-orange-400" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.01 }} className="glass rounded-xl p-4 card cursor-default">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm mb-2`}>{stat.icon}</div>
            <p className="text-xs text-[var(--foreground)]/60">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input type="text" placeholder="Search products by name or seller..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-12 pr-4" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setCategoryFilter("ALL"); setPage(1) }} className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${categoryFilter === "ALL" ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"}`}>All</button>
            {categories.map(([key]) => (
              <button key={key} onClick={() => { setCategoryFilter(key); setPage(1) }} className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${categoryFilter === key ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--neon-cyan)]"}`}>
                {CATEGORY_ICONS[key]} {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--primary)]/5">
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Product</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Category</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Price</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Stock</th>
                <th className="text-left py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Seller</th>
                <th className="text-right py-3.5 px-4 text-[var(--foreground)]/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-[var(--foreground)]/50">
                    <div className="w-5 h-5 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" />
                    <span>Loading products...</span>
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--foreground)]/40">No products found</td></tr>
              ) : paginated.map((product) => (
                <motion.tr
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[var(--card-border)]/50 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm">{CATEGORY_ICONS[product.category]}</div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-[var(--foreground)]/50">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border border-[var(--neon-purple)]/30">
                      {CATEGORY_LABELS[product.category]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">{formatPrice(product.price)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-medium ${product.stock <= 3 ? "text-red-400" : "text-[var(--foreground)]/70"}`}>{product.stock}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--foreground)]/70">{product.seller}</td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleFeatured(product.id)} className={`p-1.5 rounded-lg transition-colors ${product.featured ? "text-[var(--neon-yellow)]" : "text-[var(--foreground)]/50 hover:text-[var(--neon-yellow)]"}`}>
                        <FiToggleRight size={16} />
                      </button>
                      <button onClick={() => toggleAvailability(product.id)} className={`p-1.5 rounded-lg transition-colors ${product.availability ? "text-green-400" : "text-[var(--foreground)]/50 hover:text-green-400"}`}>
                        {product.availability ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      </button>
                      <button onClick={() => handleEdit(product)} className="p-1.5 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--foreground)]/50 hover:text-[var(--neon-cyan)] transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => removeProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--foreground)]/50 hover:text-red-400 transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {expandedId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--card-border)]/50"
            >
              {(() => {
                const product = products.find((p) => p.id === expandedId)
                if (!product) return null
                return (
                  <div className="p-4 bg-[var(--primary)]/3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Product ID</p>
                        <p className="text-sm font-mono text-[var(--neon-cyan)]">{product.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Category</p>
                        <p className="text-sm">{CATEGORY_LABELS[product.category]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Featured</p>
                        <p className="text-sm">{product.featured ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground)]/50">Created</p>
                        <p className="text-sm">{formatDate(product.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between glass rounded-xl px-4 py-3 card">
          <p className="text-sm text-[var(--foreground)]/60">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "gradient-bg text-white" : "border border-[var(--card-border)] text-[var(--foreground)]/60 hover:border-[var(--neon-cyan)]"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-[var(--card-border)] hover:border-[var(--neon-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FiChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", category: "GAMING_ACCOUNTS", price: "", stock: "", seller: "", image: "" }) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 border border-[var(--card-border)] w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", category: "GAMING_ACCOUNTS", price: "", stock: "", seller: "", image: "" }) }} className="p-1 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g. Fortnite Rare Account" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })} className="input-field">
                    {categories.map(([key, label]) => (
                      <option key={key} value={key}>{CATEGORY_ICONS[key]} {label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Price ($)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field" placeholder="0.00" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Stock</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="input-field" placeholder="1" min="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Seller Name</label>
                  <input type="text" value={formData.seller} onChange={(e) => setFormData({ ...formData, seller: e.target.value })} className="input-field" placeholder="e.g. GameKing" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Product Image</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="input-field flex items-center gap-2 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">
                        <FiPackage size={16} />
                        <span>{formData.image ? "Image selected" : "Choose image..."}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploading(true)
                          try {
                            const fd = new FormData()
                            fd.append("file", file)
                            const res = await fetch("/api/upload", { method: "POST", body: fd })
                            const data = await res.json()
                            if (data.url) {
                              setFormData({ ...formData, image: data.url })
                              toast.success("Image uploaded!")
                            } else {
                              toast.error(data.error || "Upload failed")
                            }
                          } catch {
                            toast.error("Upload failed")
                          } finally {
                            setUploading(false)
                          }
                        }}
                      />
                    </label>
                    {uploading && <div className="text-sm text-[var(--neon-cyan)] animate-pulse">Uploading...</div>}
                    {formData.image && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--card-border)] flex-shrink-0">
                        <img src={formData.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", category: "GAMING_ACCOUNTS", price: "", stock: "", seller: "", image: "" }) }} className="btn-secondary text-sm px-6 py-2">Cancel</button>
                <button
                  onClick={async () => {
                    if (!formData.name || !formData.price || !formData.stock || !formData.seller) {
                      toast.error("Please fill in all fields")
                      return
                    }
                    try {
                      if (editingId) {
                        const res = await fetch(`/api/products/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.name, category: formData.category, price: parseFloat(formData.price), stock: parseInt(formData.stock) }) })
                        if (!res.ok) throw new Error()
                        toast.success("Product updated successfully!")
                      } else {
                        const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.name, category: formData.category, price: parseFloat(formData.price), stock: parseInt(formData.stock) }) })
                        if (!res.ok) throw new Error()
                        toast.success("Product added successfully!")
                      }
                      setFormData({ name: "", category: "GAMING_ACCOUNTS", price: "", stock: "", seller: "", image: "" })
                      setShowForm(false)
                      setEditingId(null)
                      fetchProducts()
                    } catch { toast.error("Operation failed") }
                  }}
                  className="btn-primary text-sm px-6 py-2"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
