'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, BookOpen, CreditCard, MessageSquare, Briefcase, Star, Gift, Info } from 'lucide-react'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  link?: string
  createdAt: string
}

const typeIcons: Record<string, React.ReactNode> = {
  BOOKING:  <BookOpen className="w-4 h-4 text-blue-400" />,
  PAYMENT:  <CreditCard className="w-4 h-4 text-green-400" />,
  MESSAGE:  <MessageSquare className="w-4 h-4 text-purple-400" />,
  CASE:     <Briefcase className="w-4 h-4 text-orange-400" />,
  REVIEW:   <Star className="w-4 h-4 text-yellow-400" />,
  REFERRAL: <Gift className="w-4 h-4 text-pink-400" />,
  SYSTEM:   <Info className="w-4 h-4 text-slate-400" />,
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // Silently fail if the API isn't available
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  const markOneRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-purple-500/5' : ''}`}
                  onClick={() => { markOneRead(n.id); if (n.link) window.location.href = n.link; setOpen(false) }}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                    {typeIcons[n.type] || typeIcons.SYSTEM}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
