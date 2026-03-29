// pages/notifications/NotificationList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// FIX:
//   • Row click → markReadLocal (orange dot hata) + markAllAsRead API
//   • Navbar badge refreshed via context's refreshUnreadCount
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/notificationService/notificationService'
import { useNotifications } from '../../context/NotificationContext'
import {
  Bell, Check, Trash2, Users, Calendar,
  BookOpen, FileText, Clock, ChevronRight, ArrowLeft,
  Search, AlertCircle, Loader2, CheckCircle, X,
  ChevronLeft, ChevronDown, Printer, Eye, MailOpen
} from 'lucide-react'

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in
      ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
    >
      {toast.type === 'success'
        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 flex-shrink-0" />
      }
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="p-4 border-b border-gray-100 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-72" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
    </div>
  </div>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d)) return ''
  const diff = Date.now() - d
  const days = Math.floor(diff / 86400000)
  if (days < 1) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'long' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatFullDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const formatFullTime = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return isNaN(d) ? 'N/A' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// getSentNotifications response normalise
const normalise = (n) => {
  if (!n || typeof n !== 'object') return null
  return {
    id:              n.notification_id   ?? n.id,
    title:           n.title             ?? 'No Title',
    message:         n.description       ?? n.message ?? '',
    type:            n.type              ?? 'general',
    status:          n.status === 1 || n.status === 'SENT' ? 'SENT' : String(n.status || ''),
    read:            n.is_read === 1     || n.is_read === true || n.read === true || false,
    createdAt:       n.created_at        ?? n.createdAt ?? new Date().toISOString(),
    recipientsCount: n.recipients_count  ?? 0,
    readCount:       n.read_count        ?? 0,
    targets: Array.isArray(n.targets)    ? n.targets
           : Array.isArray(n.recipients) ? n.recipients
           : [],
  }
}

const getTargetLabel = (t) => {
  if (!t || typeof t !== 'object') return 'Recipient'
  if (t.label) return t.label
  if (t.target_type === 'school_wide') return 'All School'
  if (t.target_type === 'class') return t.class_name || `Class ${t.class_id}`
  if (t.target_type === 'class_section') return `${t.class_name || 'Class'} - ${t.section_name || 'Section'}`
  if (t.target_type === 'role') return t.role ? t.role.charAt(0).toUpperCase() + t.role.slice(1) + 's' : 'Role'
  return t.target_type || 'Recipient'
}

const LIMIT = 10

// ─── PDF Modal ─────────────────────────────────────────────────────────────────
const NotificationModal = ({ notification: n, onClose, onDelete, deleting }) => {
  const printRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || ''
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${n.title}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Georgia,serif;color:#111;padding:48px;line-height:1.7}
        .header{border-bottom:3px solid #f97316;padding-bottom:22px;margin-bottom:28px}
        h1{font-size:26px;font-weight:bold;margin-bottom:8px;color:#111}
        .badge{display:inline-block;padding:3px 12px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;margin-right:8px}
        .meta{font-size:12px;color:#666;font-family:Arial,sans-serif}
        .lbl{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#aaa;font-weight:700;font-family:Arial,sans-serif;margin-bottom:8px}
        .msgbox{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;font-size:14px;white-space:pre-wrap;color:#111}
        .tag{display:inline-block;padding:4px 12px;background:#fff7ed;border:1px solid #fdba74;border-radius:20px;font-size:12px;color:#c2410c;margin:3px;font-family:Arial,sans-serif}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px}
        .blbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#aaa;font-family:Arial,sans-serif;margin-bottom:5px}
        .bval{font-size:14px;font-weight:600;color:#111}
        .bvallg{font-size:22px;font-weight:800;color:#111}
        .footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#bbb;text-align:center;font-family:Arial,sans-serif}
      </style>
    </head><body>${content}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-gray-900 text-sm font-semibold">
            <FileText className="w-4 h-4 text-orange-500" />
            Notification Details
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button onClick={() => onDelete(n.id)} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6">
          <div ref={printRef}>
            {/* Header */}
            <div className="border-b-2 border-orange-400 pb-5 mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold font-sans">
                School Notification
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{n.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                {(n.status === 'SENT' || n.status === 1) && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-sans">
                    ✓ Sent
                  </span>
                )}
                <span className="text-xs text-gray-600 font-sans">
                  {formatFullDate(n.createdAt)} &nbsp;·&nbsp; {formatFullTime(n.createdAt)}
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold font-sans mb-2">Message</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                  {n.message || 'No message content.'}
                </p>
              </div>
            </div>

            {/* Sent To */}
            {n.targets && n.targets.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold font-sans mb-2">Sent To</p>
                <div className="flex flex-wrap gap-2">
                  {n.targets.map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg text-sm font-medium">
                      <Users className="w-3.5 h-3.5" />
                      {getTargetLabel(t)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1">Date</p>
                <p className="font-semibold text-gray-900 text-sm">{formatFullDate(n.createdAt)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1">Time</p>
                <p className="font-semibold text-gray-900 text-sm">{formatFullTime(n.createdAt)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Total Recipients
                </p>
                <p className="font-bold text-gray-900 text-xl">{n.recipientsCount}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Read By
                </p>
                <p className="font-bold text-gray-900 text-xl">{n.readCount}</p>
              </div>
            </div>

            {/* Print footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center font-sans">
              Generated on {new Date().toLocaleString()} · School Management System
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const NotificationList = () => {
  const navigate = useNavigate()
  // ✅ Get refreshUnreadCount from context to update navbar badge
  const { refreshUnreadCount } = useNotifications()

  const [allNotifications, setAllNotifications] = useState([])
  const [loading,          setLoading]          = useState(true)
  const [actionLoading,    setActionLoading]    = useState(null)
  const [error,            setError]            = useState('')
  const [toast,            setToast]            = useState(null)

  const [readFilter,  setReadFilter]  = useState('all')
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)

  const [selectedNotif, setSelectedNotif] = useState(null)
  const [modalDeleting, setModalDeleting] = useState(false)

  // ── Fetch sent notifications ─────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await notificationService.getSentNotifications()
        let raw = []
        if (Array.isArray(res))                          raw = res
        else if (Array.isArray(res?.data))               raw = res.data
        else if (Array.isArray(res?.data?.notifications)) raw = res.data.notifications
        else if (Array.isArray(res?.notifications))      raw = res.notifications

        setAllNotifications(raw.map(normalise).filter(Boolean))
      } catch (err) {
        setError(err.message || 'Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── Debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // ── Filter + paginate ────────────────────────────────────────────────────
  const filtered = allNotifications.filter(n => {
    if (readFilter === 'unread' && n.read) return false
    if (readFilter === 'read'   && !n.read) return false
    if (typeFilter !== 'all' && String(n.type).toLowerCase() !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / LIMIT))
  const paginated   = filtered.slice((page - 1) * LIMIT, page * LIMIT)
  const unreadCount = allNotifications.filter(n => !n.read).length

  // ── ✅ Mark as read — LOCAL + markAllAsRead API + navbar badge refresh ────
  const markReadLocal = async (id) => {
    // Local state update (orange dot hata)
    setAllNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setSelectedNotif(prev => prev?.id === id ? { ...prev, read: true } : prev)

    // ✅ Background: call markAllAsRead API so server stays in sync
    try {
      await notificationService.markAllAsRead()
      // ✅ Refresh navbar badge count from server
      refreshUnreadCount?.()
    } catch (err) {
      console.error('markAllAsRead background failed:', err)
      // UI is already updated — silent fail is ok
    }
  }

  // ── ✅ Mark All as Read ─────────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setAllNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setSelectedNotif(prev => prev ? { ...prev, read: true } : null)
      // ✅ Refresh navbar badge
      refreshUnreadCount?.()
      setToast({ type: 'success', message: 'All notifications marked as read' })
    } catch {
      setToast({ type: 'error', message: 'Failed to mark all as read' })
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation()
    setActionLoading(id)
    setModalDeleting(true)
    try {
      await notificationService.deleteNotification(id)
      setAllNotifications(prev => prev.filter(n => n.id !== id))
      if (selectedNotif?.id === id) setSelectedNotif(null)
      setToast({ type: 'success', message: 'Notification deleted' })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete' })
    } finally {
      setActionLoading(null)
      setModalDeleting(false)
    }
  }

  // ── ✅ Row click — open modal + mark read ────────────────────────────────
  const handleRowClick = (n) => {
    setSelectedNotif({ ...n, read: true })
    if (!n.read) markReadLocal(n.id) // orange dot hata + navbar badge update
  }

  return (
    <div className="w-full pb-12">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {selectedNotif && (
        <NotificationModal
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onDelete={(id) => handleDelete(id)}
          deleting={modalDeleting}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-500" />
              Notifications
              {/* ✅ Unread badge — decrements as you read */}
              {unreadCount > 0 && (
                <span className="ml-1 px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-sm">Manage and broadcast school-wide announcements</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-medium transition-colors">
              <MailOpen className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <button
            onClick={() => navigate('/admin/notifications/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            + Create Notification
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',  value: allNotifications.length,              Icon: Bell,  bg: 'bg-blue-100',   color: 'text-blue-700'  },
          { label: 'Unread', value: unreadCount,                          Icon: Clock, bg: 'bg-orange-100', color: 'text-orange-700' },
          { label: 'Read',   value: allNotifications.length - unreadCount, Icon: Check, bg: 'bg-green-100', color: 'text-green-700'  },
        ].map(({ label, value, Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {[
              { key: 'all',    label: 'All' },
              { key: 'unread', label: unreadCount > 0 ? `Unread (${unreadCount})` : 'Unread' },
              { key: 'read',   label: 'Read' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setReadFilter(key); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${readFilter === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">All Types</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="general">General</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No notifications found</h3>
            <p className="text-gray-500 text-sm">
              {search ? `No results for "${search}"` : 'No notifications to display'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginated.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRowClick(n)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group
                  ${!n.read ? 'bg-orange-50/50' : 'bg-white'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Bell Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${!n.read ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <Bell className={`w-5 h-5 ${!n.read ? 'text-orange-600' : 'text-gray-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`text-sm truncate ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </h3>
                        {n.message && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 text-xs">{n.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(n.createdAt)}</span>
                        {/* ✅ Orange dot — hatega jab read hoga */}
                        {!n.read && (
                          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(n.createdAt)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 capitalize">
                        {n.type === 'general' ? 'General' : n.type}
                      </span>
                      {n.recipientsCount > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {n.recipientsCount} recipients
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); handleRowClick(n) }}
                      className="p-2 hover:bg-blue-50 rounded-lg" title="View">
                      <Eye className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                    </button>
                    {!n.read && (
                      <button
                        onClick={e => { e.stopPropagation(); markReadLocal(n.id) }}
                        className="p-2 hover:bg-green-50 rounded-lg" title="Mark as Read">
                        <Check className="w-4 h-4 text-gray-500 hover:text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={e => handleDelete(n.id, e)}
                      disabled={actionLoading === n.id}
                      className="p-2 hover:bg-red-50 rounded-lg" title="Delete">
                      {actionLoading === n.id
                        ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        : <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      }
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > LIMIT && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                  ${page === pg ? 'bg-orange-500 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-800'}`}>
                {pg}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .animate-slide-in { animation: slide-in 0.3s ease forwards; }
      `}</style>
    </div>
  )
}

export default NotificationList