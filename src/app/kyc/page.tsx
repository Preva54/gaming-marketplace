"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiShield, FiCheckCircle, FiXCircle, FiClock, FiUpload, FiAlertTriangle } from "react-icons/fi"
import toast from "react-hot-toast"

interface KycInfo {
  id: string; userId: string; status: string
  documents: { id: string; type: string; fileUrl: string; status: string; createdAt: Date }[]
  rejectionReason?: string; submittedAt?: Date; reviewedAt?: Date
}

export default function KycPage() {
  const [kyc, setKyc] = useState<KycInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState("GOVT_ID")

  useEffect(() => { fetchKyc() }, [])

  async function fetchKyc() {
    try { const r = await fetch("/api/kyc"); if (r.ok) setKyc(await r.json()) } catch {}
    setLoading(false)
  }

  async function handleSubmit() {
    if (!selectedFile) { toast.error("Select a file"); return }
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) { toast.error("Upload failed"); return }
      const { url } = await uploadRes.json()

      const r = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: [{ type: docType, fileUrl: url }] }),
      })
      if (r.ok) { toast.success("KYC submitted!"); fetchKyc(); setSelectedFile(null) }
      else { const d = await r.json(); toast.error(d.error || "Failed") }
    } catch { toast.error("Failed") }
  }

  const statusIcon: Record<string, React.ReactNode> = {
    NOT_STARTED: <FiClock className="text-[var(--foreground)]/40" size={48} />,
    PENDING_REVIEW: <FiClock className="text-[var(--neon-yellow)]" size={48} />,
    APPROVED: <FiCheckCircle className="text-green-400" size={48} />,
    REJECTED: <FiXCircle className="text-red-400" size={48} />,
  }

  const statusMessage: Record<string, string> = {
    NOT_STARTED: "You haven't started KYC verification yet.",
    PENDING_REVIEW: "Your documents are being reviewed by our team.",
    APPROVED: "Your identity has been verified! You can now sell products.",
    REJECTED: "Your KYC application was rejected. Please resubmit.",
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <FiShield /> KYC Verification
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1">Verify your identity to start selling on Nexus Market</p>
      </div>

      <div className="glass rounded-xl p-8 card text-center">
        <div className="flex justify-center mb-4">
          {statusIcon[kyc?.status || "NOT_STARTED"]}
        </div>
        <h2 className="text-xl font-bold mb-2">
          {kyc?.status?.replace(/_/g, " ") || "Not Started"}
        </h2>
        <p className="text-[var(--foreground)]/60">{statusMessage[kyc?.status || "NOT_STARTED"]}</p>
        {kyc?.status === "REJECTED" && kyc.rejectionReason && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <FiAlertTriangle className="mt-0.5 flex-shrink-0" />
            <span>{kyc.rejectionReason}</span>
          </div>
        )}
      </div>

      {(kyc?.status === "NOT_STARTED" || kyc?.status === "REJECTED") && (
        <div className="glass rounded-xl p-6 card">
          <h3 className="text-lg font-bold mb-4">Submit Documents</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="input-field">
                <option value="GOVT_ID">Government-issued ID</option>
                <option value="SELFIE">Selfie / Portrait</option>
                <option value="PROOF_OF_ADDRESS">Proof of Address</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-[var(--foreground)]/60 mb-1 block">Upload File</label>
              <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                accept="image/*,.pdf" className="input-field" />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleSubmit} className="btn-primary">
              <FiUpload className="inline mr-2" /> Submit for Review
            </motion.button>
          </div>
        </div>
      )}

      {kyc?.documents && kyc.documents.length > 0 && (
        <div className="glass rounded-xl p-5 card">
          <h3 className="text-lg font-bold mb-4">Submitted Documents</h3>
          <div className="space-y-3">
            {kyc.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--primary)]/5">
                <div>
                  <p className="text-sm font-medium">{doc.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-[var(--foreground)]/50">{doc.createdAt.toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  doc.status === "APPROVED" ? "bg-green-500/20 text-green-400" :
                  doc.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{doc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
