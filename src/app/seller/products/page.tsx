"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiPackage, FiPlus, FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiImage, FiCheck } from "react-icons/fi"
import { formatPrice } from "@/lib/utils"
import { CATEGORY_LABELS, type ProductCategory } from "@/types"
import toast from "react-hot-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "GAME_KEYS" as ProductCategory,
    description: "",
    price: "",
    stock: "",
    availability: true,
  })

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      const r = await fetch("/api/seller/products")
      if (r.ok) setProducts(await r.json())
    } catch {}
    setLoading(false)
  }

  const filteredProducts = useMemo(
    () => products.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

  const resetForm = () => {
    setFormData({ name: "", category: "GAME_KEYS", description: "", price: "", stock: "", availability: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price) return

    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 1,
        availability: formData.availability,
      }

      if (editingId) {
        const r = await fetch(`/api/products/${editingId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        })
        if (r.ok) { toast.success("Product updated!"); fetchProducts(); resetForm() }
        else { const d = await r.json(); toast.error(d.error || "Failed") }
      } else {
        const r = await fetch("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        })
        if (r.ok) { toast.success("Product created!"); fetchProducts(); resetForm() }
        else { const d = await r.json(); toast.error(d.error || "Failed") }
      }
    } catch { toast.error("Failed to save product") }
  }

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock || 0),
      availability: product.availability !== false,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (r.ok) { toast.success("Product deleted!"); fetchProducts() }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed to delete") }
  }

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      const r = await fetch(`/api/products/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: !current }),
      })
      if (r.ok) fetchProducts()
    } catch { toast.error("Failed") }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Product Management</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Manage your gaming products</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Add New Product
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl p-4 card">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-12 pr-4" />
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="glass rounded-xl p-6 card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={resetForm} className="text-[var(--foreground)]/50 hover:text-[var(--neon-pink)] transition-colors"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Product Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Enter product name" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as ProductCategory }))} className="input-field">
                      {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Price ($)</label>
                    <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} className="input-field" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--foreground)]/70">Stock</label>
                    <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))} className="input-field" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[var(--foreground)]/70">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="input-field min-h-[100px] resize-y" placeholder="Describe your product..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[var(--foreground)]/70">Images</label>
                  <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center hover:border-[var(--neon-cyan)] transition-colors cursor-pointer group">
                    <FiImage size={36} className="mx-auto text-[var(--foreground)]/30 group-hover:text-[var(--neon-cyan)] transition-colors" />
                    <p className="text-sm text-[var(--foreground)]/50 mt-2">Click or drag to upload images</p>
                    <p className="text-xs text-[var(--foreground)]/30 mt-1">PNG, JPG, WEBP (max 5MB)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData((p) => ({ ...p, availability: !p.availability }))} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${formData.availability ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-gray-500/30 text-gray-400 bg-gray-500/10"}`}>
                    {formData.availability ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                    {formData.availability ? "Available" : "Unavailable"}
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex items-center gap-2"><FiCheck size={16} /> {editingId ? "Update Product" : "Add Product"}</button>
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, scale: 1.02 }} className="glass rounded-xl p-5 card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center text-white text-xl"><FiPackage /></div>
              <div className="flex gap-1">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--foreground)]/50 hover:text-[var(--neon-cyan)] transition-colors"><FiEdit2 size={14} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggleAvailability(product.id, product.availability)} className={`p-2 rounded-lg hover:bg-[var(--primary)]/10 transition-colors ${product.availability !== false ? "text-green-400" : "text-gray-500"}`}>
                  {product.availability !== false ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--foreground)]/50 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></motion.button>
              </div>
            </div>
            <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
            <p className="text-xs text-[var(--foreground)]/50 mb-2">{CATEGORY_LABELS[product.category as ProductCategory] || product.category} &bull; {product.sales || 0} sales</p>
            <p className="text-sm text-[var(--foreground)]/70 line-clamp-2 mb-3">{product.description}</p>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--card-border)]/50">
              <span className="text-lg font-bold gradient-text">{formatPrice(product.price)}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${product.availability ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]" : "bg-gray-500/20 text-gray-400"}`}>
                  {product.availability ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FiPackage size={48} className="mx-auto text-[var(--foreground)]/20 mb-4" />
            <p className="text-[var(--foreground)]/40 text-lg">No products found</p>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary mt-4 inline-flex items-center gap-2"><FiPlus size={16} /> Add Your First Product</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
