// pages/notifications/NotificationDetails.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Opens as PDF-style popup modal over the list
// Shows: title, description, sent-to targets, date/time, recipients_count,
//        read_count, AND full recipients list with read/unread status
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/notificationService/notificationService'
import {
  Bell, ArrowLeft, Calendar, Clock, Trash2,
  Users, FileText, AlertCircle, Loader2,
  CheckCircle, X, Printer, User, Check,
  ChevronLeft, ChevronRight, MailOpen, Mail,
  Search
} from 'lucide-react'

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in
      ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success'
        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Skeleton Modal ───────────────────────────────────────────────────────────
const SkeletonModal = () => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-gray-200 rounded-lg" />
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="pb-5 border-b space-y-3">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-72 bg-gray-300 rounded" />
          <div className="h-3 w-48 bg-gray-200 rounded" />
        </div>
        <div className="h-24 w-full bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFullDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}
const formatFullTime = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return isNaN(d) ? 'N/A' : d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
const formatShortDate = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  return isNaN(d) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const getTargetLabel = (t) => {
  if (!t || typeof t !== 'object') return 'Recipient'
  if (t.label) return t.label
  if (t.target_type === 'school_wide') return 'All School'
  if (t.target_type === 'class') return t.class_name || `Class ${t.class_id}`
  if (t.target_type === 'class_section') return `${t.class_name || 'Class'} – ${t.section_name || 'Section'}`
  if (t.target_type === 'role') return t.role ? t.role.charAt(0).toUpperCase() + t.role.slice(1) + 's' : 'Role'
  return t.target_type || 'Recipient'
}
const roleLabel = (role) =>
  role ? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''

const roleColor = (role) => {
  switch (String(role || '').toLowerCase()) {
    case 'school_admin': return 'bg-orange-100 text-orange-800'
    case 'teacher':      return 'bg-indigo-100 text-indigo-800'
    case 'student':      return 'bg-blue-100 text-blue-800'
    case 'parent':       return 'bg-pink-100 text-pink-800'
    case 'staff':        return 'bg-gray-100 text-gray-700'
    default:             return 'bg-gray-100 text-gray-700'
  }
}

// ─── Recipients Tab ───────────────────────────────────────────────────────────
const RecipientsPanel = ({ notificationId, recipientsCount, readCount }) => {
  const [recipients, setRecipients]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [readFilter, setReadFilter]   = useState('all') // all | read | unread
  const [page, setPage]               = useState(1)
  const [pagination, setPagination]   = useState(null)
  const LIMIT = 10

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await notificationService.getNotificationRecipients(notificationId, { page: 1, limit: 100 })
        // Response: { success, data: [...], pagination: { total_items, ... } }
        const raw = Array.isArray(res?.data) ? res.data : []
        setRecipients(raw)
        setPagination(res?.pagination ?? null)
      } catch (err) {
        setError(err.message || 'Failed to load recipients')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [notificationId])

  // Filter
  const filtered = recipients.filter(r => {
    const isRead = r.is_read === 1 || r.is_read === true
    if (readFilter === 'read'   && !isRead) return false
    if (readFilter === 'unread' &&  isRead) return false
    if (search) {
      const q = search.toLowerCase()
      const name  = (r.name  || r.user_name  || '').toLowerCase()
      const email = (r.email || r.user_email || '').toLowerCase()
      const role  = (r.role  || r.user_role  || '').toLowerCase()
      if (!name.includes(q) && !email.includes(q) && !role.includes(q)) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT))
  const paginated  = filtered.slice((page - 1) * LIMIT, page * LIMIT)
  const readCount2 = recipients.filter(r => r.is_read === 1 || r.is_read === true).length

  if (loading) return (
    <div className="py-8 flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      <p className="text-sm text-gray-500">Loading recipients...</p>
    </div>
  )

  if (error) return (
    <div className="py-6 text-center text-red-500 text-sm flex items-center justify-center gap-2">
      <AlertCircle className="w-4 h-4" /> {error}
    </div>
  )

  return (
    <div>
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Sent',  value: recipients.length || recipientsCount, color: 'text-blue-700',   bg: 'bg-blue-50',   Icon: Users },
          { label: 'Read',        value: readCount2,                            color: 'text-green-700',  bg: 'bg-green-50',  Icon: MailOpen },
          { label: 'Unread',      value: (recipients.length || recipientsCount) - readCount2, color: 'text-orange-700', bg: 'bg-orange-50', Icon: Mail },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email or role..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: 'all',    label: 'All' },
            { key: 'read',   label: `Read (${readCount2})` },
            { key: 'unread', label: `Unread (${(recipients.length || recipientsCount) - readCount2})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setReadFilter(key); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                ${readFilter === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {recipients.length === 0 ? (
        <div className="py-10 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recipient data available yet</p>
          <p className="text-xs text-gray-400 mt-1">Recipients will appear here after the notification is delivered</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No results for "{search}"</div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 uppercase tracking-wide">#</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 uppercase tracking-wide">Name</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 uppercase tracking-wide">Role</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-700 uppercase tracking-wide hidden md:table-cell">Read At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((r, i) => {
                  const isRead    = r.is_read === 1 || r.is_read === true
                  const name      = r.name       || r.user_name  || 'Unknown'
                  const email     = r.email      || r.user_email || '—'
                  const role      = r.role       || r.user_role  || ''
                  const readAt    = r.read_at    || r.readAt     || null
                  const initials  = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                  return (
                    <tr key={r.user_id ?? r.id ?? i}
                      className={`transition-colors ${isRead ? 'bg-white' : 'bg-orange-50/30'}`}>
                      <td className="px-3 py-2.5 text-gray-500 font-medium">
                        {(page - 1) * LIMIT + i + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${isRead ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-[100px]">{name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell truncate max-w-[140px]">{email}</td>
                      <td className="px-3 py-2.5">
                        {role && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColor(role)}`}>
                            {roleLabel(role)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {isRead ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">
                            <Check className="w-3 h-3" /> Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-semibold">
                            <Mail className="w-3 h-3" /> Unread
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 hidden md:table-cell">
                        {readAt ? formatShortDate(readAt) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1,p-1))}
                  disabled={page===1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
                </button>
                {Array.from({ length: Math.min(totalPages,5) }, (_, i) => i+1).map(pg => (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                      ${page===pg ? 'bg-orange-500 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-800'}`}
                  >{pg}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages,p+1))}
                  disabled={page===totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── PDF Modal ────────────────────────────────────────────────────────────────
const NotificationPDFModal = ({ notification: n, onClose, onDelete, deleting }) => {
  const printRef  = useRef(null)
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'recipients'

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
        .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:#888;margin-bottom:8px;font-family:Arial,sans-serif}
        h1{font-size:26px;font-weight:bold;margin-bottom:8px;color:#111}
        .badge{display:inline-block;padding:3px 12px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;margin-right:8px}
        .meta{font-size:12px;color:#666;font-family:Arial,sans-serif}
        .section{margin-bottom:24px}
        .lbl{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#aaa;font-weight:700;font-family:Arial,sans-serif;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #f0f0f0}
        .msgbox{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;font-size:14px;white-space:pre-wrap;color:#111}
        .tag{display:inline-block;padding:4px 12px;background:#fff7ed;border:1px solid #fdba74;border-radius:20px;font-size:12px;color:#c2410c;margin:3px;font-family:Arial,sans-serif}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px}
        .blbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#aaa;font-family:Arial,sans-serif;margin-bottom:5px}
        .bval{font-size:14px;font-weight:600;color:#111}
        .bvalLg{font-size:22px;font-weight:800;color:#111}
        table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;font-family:Arial,sans-serif}
        th{background:#f9fafb;padding:8px 12px;text-align:left;font-weight:700;color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb}
        td{padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#111}
        .read-badge{display:inline-block;padding:2px 8px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:10px;font-weight:700}
        .unread-badge{display:inline-block;padding:2px 8px;background:#fff7ed;color:#c2410c;border-radius:20px;font-size:10px;font-weight:700}
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Toolbar ── */}
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
            <button onClick={onDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0 border-b border-gray-200 bg-white flex-shrink-0 px-5">
          {[
            { key: 'details',    label: 'Details',    icon: FileText },
            { key: 'recipients', label: `Recipients (${n.recipientsCount ?? n.recipients_count ?? 0})`, icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === key
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 p-6">

          {activeTab === 'details' && (
            <div ref={printRef}>
              {/* PDF Header */}
              <div className="header border-b-2 border-orange-400 pb-5 mb-6">
                <p className="eyebrow text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold font-sans">
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
                    {formatFullDate(n.createdAt ?? n.created_at)} &nbsp;·&nbsp; {formatFullTime(n.createdAt ?? n.created_at)}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="section mb-6">
                <p className="lbl text-xs uppercase tracking-widest text-gray-500 font-semibold font-sans mb-2">
                  Message / Description
                </p>
                <div className="msgbox bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {n.description ?? n.message ?? 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Sent To */}
              {n.targets && n.targets.length > 0 && (
                <div className="section mb-6">
                  <p className="lbl text-xs uppercase tracking-widest text-gray-500 font-semibold font-sans mb-2">
                    Sent To
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {n.targets.map((t, i) => (
                      <span key={i} className="tag flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg text-sm font-medium">
                        <Users className="w-3.5 h-3.5" />
                        {getTargetLabel(t)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="box bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="blbl text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </p>
                  <p className="bval font-semibold text-gray-900 text-sm">{formatFullDate(n.createdAt ?? n.created_at)}</p>
                </div>
                <div className="box bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="blbl text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </p>
                  <p className="bval font-semibold text-gray-900 text-sm">{formatFullTime(n.createdAt ?? n.created_at)}</p>
                </div>
                <div className="box bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="blbl text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Total Recipients
                  </p>
                  <p className="bvalLg font-bold text-gray-900 text-xl">{n.recipientsCount ?? n.recipients_count ?? 0}</p>
                </div>
                <div className="box bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="blbl text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Read By
                  </p>
                  <p className="bvalLg font-bold text-gray-900 text-xl">{n.readCount ?? n.read_count ?? 0}</p>
                </div>
              </div>

              {/* Print footer */}
              <div className="footer mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center font-sans">
                Generated on {new Date().toLocaleString()} · School Management System
              </div>
            </div>
          )}

          {activeTab === 'recipients' && (
            <RecipientsPanel
              notificationId={n.id ?? n.notification_id}
              recipientsCount={n.recipientsCount ?? n.recipients_count ?? 0}
              readCount={n.readCount ?? n.read_count ?? 0}
            />
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to List
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const NotificationDetails = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [notification, setNotification] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [toast,        setToast]        = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res  = await notificationService.getNotificationById(id)
        let notif  = res?.data || res

        if (notif) {
          notif = {
            ...notif,
            id:              notif.notification_id ?? notif.id,
            createdAt:       notif.created_at      ?? notif.createdAt,
            message:         notif.description     ?? notif.message,
            recipientsCount: notif.recipients_count ?? notif.recipientsCount ?? 0,
            readCount:       notif.read_count       ?? notif.readCount       ?? 0,
            targets:         Array.isArray(notif.targets)    ? notif.targets
                           : Array.isArray(notif.recipients) ? notif.recipients
                           : [],
          }
        }
        setNotification(notif)
      } catch (err) {
        setError(err.message || 'Failed to load notification')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await notificationService.deleteNotification(notification.id)
      setToast({ type: 'success', message: 'Notification deleted' })
      setTimeout(() => navigate('/admin/notifications'), 1500)
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete' })
      setDeleting(false)
    }
  }

  if (loading) return <SkeletonModal />

  if (error || !notification) {
    return (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={() => navigate('/admin/notifications')}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center"
          onClick={e => e.stopPropagation()}>
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{error || 'Not found'}</h3>
          <p className="text-gray-600 mb-6 text-sm">The notification you're looking for doesn't exist or was deleted.</p>
          <button onClick={() => navigate('/admin/notifications')}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
            Back to Notifications
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      <NotificationPDFModal
        notification={notification}
        onClose={() => navigate('/admin/notifications')}
        onDelete={handleDelete}
        deleting={deleting}
      />
      <style>{`
        @keyframes slide-in { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .animate-slide-in { animation: slide-in 0.3s ease forwards; }
      `}</style>
    </>
  )
}

export { NotificationPDFModal }
export default NotificationDetails