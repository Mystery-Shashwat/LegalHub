'use client'
import { useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { AlertTriangle, X, Send } from 'lucide-react'

interface RaiseDisputeModalProps {
  bookingId: string
  lawyerName: string
  onClose: () => void
  onSuccess?: () => void
}

const DISPUTE_REASONS = [
  'Lawyer did not show up for the session',
  'Session quality was very poor',
  'Wrong or misleading legal advice given',
  'Lawyer was rude or unprofessional',
  'Payment charged but service not delivered',
  'Other',
]

export default function RaiseDisputeModal({ bookingId, lawyerName, onClose, onSuccess }: RaiseDisputeModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return toast.error('Please select a reason')
    if (!description.trim() || description.trim().length < 20) return toast.error('Please describe the issue in at least 20 characters')

    setSubmitting(true)
    try {
      await api.post('/admin/disputes', {
        bookingId,
        reason,
        description: description.trim()
      })
      setDone(true)
      onSuccess?.()
    } catch {
      toast.error('Failed to submit dispute. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Raise a Dispute</h2>
              <p className="text-slate-400 text-xs">Against {lawyerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Dispute Submitted</h3>
            <p className="text-slate-400 text-sm mb-6">Our admin team will review your case and respond within 48 hours. You&apos;ll receive a notification with the outcome.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reason for dispute <span className="text-red-400">*</span></label>
              <div className="space-y-2">
                {DISPUTE_REASONS.map(r => (
                  <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-red-500"
                    />
                    <span className="text-sm text-slate-300">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Describe the issue <span className="text-red-400">*</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please provide details about what happened, including dates and specifics (min 20 characters)…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 text-sm resize-none"
              />
              <p className="text-slate-500 text-xs mt-1">{description.trim().length} / 500 characters</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reason || description.trim().length < 20}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Dispute'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
