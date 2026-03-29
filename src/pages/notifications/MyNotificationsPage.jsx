// pages/notifications/MyNotificationsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// FIX:
//   • handleRowClick → calls context's markAsRead (which hits markAllAsRead API)
//   • navbar unread badge auto-decrements via context
//   • handleMarkAllAsRead → API + local state
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../services/notificationService/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell, Check, Trash2, Clock, ChevronRight, Search,
  AlertCircle, Loader2, CheckCircle, X, ChevronLeft,
  Printer, FileText, User, Mail, Calendar, ArrowLeft,
  Eye, MailOpen, Inbox
} from 'lucide-react';

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
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
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="p-4 border-b border-gray-100 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-full max-w-xs" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const diff = Date.now() - d;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatFullDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
const formatFullTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d) ? 'N/A' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Normalise getMyNotifications response fields
const normalise = (n) => {
  if (!n || typeof n !== 'object') return null;
  return {
    id:          n.notification_id ?? n.id,
    title:       n.title           ?? 'No Title',
    message:     n.description     ?? n.message ?? '',
    createdAt:   n.created_at      ?? n.createdAt ?? new Date().toISOString(),
    status:      n.status,
    read:        n.is_read === 1   || n.is_read === true || n.read === true,
    readAt:      n.read_at         ?? null,
    senderName:  n.sender_name     ?? 'School Admin',
    senderRole:  n.sender_role     ?? '',
    senderEmail: n.sender_email    ?? '',
  };
};

const roleLabel = (role) =>
  role ? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

const roleColor = (role) => {
  switch (String(role || '').toLowerCase()) {
    case 'school_admin': return 'bg-orange-100 text-orange-800';
    case 'teacher':      return 'bg-indigo-100 text-indigo-800';
    case 'student':      return 'bg-blue-100 text-blue-800';
    default:             return 'bg-gray-100 text-gray-700';
  }
};

const LIMIT = 15;

// ─── Notification Detail Modal ────────────────────────────────────────────────
const NotificationModal = ({ notification: n, onClose, onDelete, deleting }) => {
  const printRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${n.title}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Georgia,serif;color:#111;padding:48px;line-height:1.7}
        .header{border-bottom:3px solid #f97316;padding-bottom:22px;margin-bottom:28px}
        .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:#888;margin-bottom:8px;font-family:Arial,sans-serif}
        h1{font-size:26px;font-weight:bold;margin-bottom:8px;color:#111}
        .badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;margin-right:8px}
        .read{background:#d1fae5;color:#065f46}.unread{background:#fff7ed;color:#c2410c}
        .lbl{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#aaa;font-weight:700;font-family:Arial,sans-serif;margin-bottom:8px}
        .msgbox{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;font-size:14px;white-space:pre-wrap;color:#111}
        .senderbox{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-top:8px}
        .sname{font-weight:700;font-size:14px;color:#111}
        .semail{font-size:12px;color:#555;font-family:Arial,sans-serif;margin-top:4px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}
        .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px}
        .blbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#aaa;font-family:Arial,sans-serif;margin-bottom:5px}
        .bval{font-size:14px;font-weight:600;color:#111}
        .footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#bbb;text-align:center;font-family:Arial,sans-serif}
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

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
            Notification
            {/* ✅ Modal opens = already marked read, so no "Unread" badge here */}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button
              onClick={() => onDelete(n.id)}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
            >
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
                {/* ✅ Always show "Read" since modal opens after marking read */}
                <span className="px-3 py-1 rounded-full text-xs font-bold font-sans bg-green-100 text-green-800">
                  ✓ Read
                </span>
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

            {/* Sender */}
            {(n.senderName || n.senderRole || n.senderEmail) && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold font-sans mb-2">Sent By</p>
                <div className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{n.senderName}</p>
                    {n.senderRole && (
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor(n.senderRole)}`}>
                        {roleLabel(n.senderRole)}
                      </span>
                    )}
                    {n.senderEmail && (
                      <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1 font-sans">
                        <Mail className="w-3 h-3" /> {n.senderEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Date / Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </p>
                <p className="font-semibold text-gray-900 text-sm">{formatFullDate(n.createdAt)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold font-sans mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time
                </p>
                <p className="font-semibold text-gray-900 text-sm">{formatFullTime(n.createdAt)}</p>
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
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MyNotificationsPage = () => {
  // ✅ Use context's markAsRead which handles API + navbar badge update
  const { markAsRead: contextMarkAsRead, refreshUnreadCount } = useNotifications();

  const [allNotifications, setAllNotifications] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [actionLoading,    setActionLoading]    = useState(null);
  const [error,            setError]            = useState('');
  const [toast,            setToast]            = useState(null);
  const [totalUnread,      setTotalUnread]      = useState(0);

  const [readFilter,  setReadFilter]  = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);

  const [selectedNotif, setSelectedNotif] = useState(null);
  const [modalDeleting, setModalDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await notificationService.getMyNotifications({ page: 1, limit: 100 });
      const data = res?.data ?? {};
      const raw  = Array.isArray(data.notifications) ? data.notifications : [];
      setAllNotifications(raw.map(normalise).filter(Boolean));
      setTotalUnread(data.unread_count ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Filter + paginate ──────────────────────────────────────────────────────
  const filtered = allNotifications.filter(n => {
    if (readFilter === 'unread' && n.read)  return false;
    if (readFilter === 'read'   && !n.read) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paginated   = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const unreadCount = allNotifications.filter(n => !n.read).length;

  // ── ✅ Mark single as read ─────────────────────────────────────────────────
  // 1. Update local page state (orange dot hata)
  // 2. Call context markAsRead (calls markAllAsRead API → navbar badge updates)
  const handleMarkAsRead = async (id) => {
    // Local page state update
    setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setTotalUnread(prev => Math.max(0, prev - 1));
    // Update modal too if open
    setSelectedNotif(prev => prev?.id === id ? { ...prev, read: true } : prev);

    // ✅ Context call: hits markAllAsRead API + refreshes navbar badge
    try {
      await contextMarkAsRead(id);
    } catch {
      // Silent — UI already updated
    }
  };

  // ── ✅ Mark all as read ────────────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setTotalUnread(0);
      // ✅ Refresh navbar badge from server
      refreshUnreadCount?.();
      setToast({ type: 'success', message: 'All notifications marked as read' });
    } catch {
      setToast({ type: 'error', message: 'Failed to mark all as read' });
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setActionLoading(id);
    setModalDeleting(true);
    try {
      await notificationService.deleteNotification(id);
      const wasUnread = allNotifications.find(n => n.id === id)?.read === false;
      setAllNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setTotalUnread(prev => Math.max(0, prev - 1));
        // ✅ Refresh navbar badge
        refreshUnreadCount?.();
      }
      setSelectedNotif(null);
      setToast({ type: 'success', message: 'Notification deleted' });
    } catch {
      setToast({ type: 'error', message: 'Failed to delete' });
    } finally {
      setActionLoading(null);
      setModalDeleting(false);
    }
  };

  // ── ✅ Open modal — mark as read on open (WhatsApp style) ─────────────────
  const handleRowClick = (n) => {
    setSelectedNotif({ ...n, read: true }); // show as read in modal immediately
    if (!n.read) {
      handleMarkAsRead(n.id); // orange dot hata + navbar badge update
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {selectedNotif && (
        <NotificationModal
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onDelete={handleDelete}
          deleting={modalDeleting}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-orange-500" />
            My Notifications
            {totalUnread > 0 && (
              <span className="ml-1 px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                {totalUnread}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">Notifications received by you</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-medium transition-colors">
            <MailOpen className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',  value: allNotifications.length,                  Icon: Bell,    bg: 'bg-blue-100',   color: 'text-blue-700'  },
          { label: 'Unread', value: unreadCount,                              Icon: Clock,   bg: 'bg-orange-100', color: 'text-orange-700' },
          { label: 'Read',   value: allNotifications.length - unreadCount,    Icon: Check,   bg: 'bg-green-100',  color: 'text-green-700'  },
        ].map(({ label, value, Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${bg} rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div>
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
            placeholder="Search notifications..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all',    label: 'All' },
            { key: 'unread', label: unreadCount > 0 ? `Unread (${unreadCount})` : 'Unread' },
            { key: 'read',   label: 'Read' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setReadFilter(key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${readFilter === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="ml-auto text-red-600 underline text-xs font-medium">Retry</button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No notifications</h3>
            <p className="text-gray-500 text-sm">
              {search ? `No results for "${search}"` : 'Your inbox is empty'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginated.map(n => (
              <div key={n.id} onClick={() => handleRowClick(n)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group
                  ${!n.read ? 'bg-orange-50/50' : 'bg-white'}`}>
                <div className="flex items-start gap-4">
                  {/* Sender avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm
                    ${!n.read ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>
                    {n.senderName ? n.senderName.charAt(0).toUpperCase() : 'S'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`text-sm truncate ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {n.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">{n.senderName}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(n.createdAt)}</span>
                        {/* ✅ Orange dot — hatega jab read hoga */}
                        {!n.read && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
                      </div>
                    </div>
                    {n.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                    )}
                  </div>

                  {/* Hover quick actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); handleRowClick(n); }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg" title="View">
                      <Eye className="w-3.5 h-3.5 text-gray-600 hover:text-blue-600" />
                    </button>
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                        className="p-1.5 hover:bg-green-50 rounded-lg" title="Mark Read">
                        <Check className="w-3.5 h-3.5 text-gray-600 hover:text-green-700" />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(n.id); }}
                      disabled={actionLoading === n.id}
                      className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                      {actionLoading === n.id
                        ? <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-600" />}
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
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
  );
};

export default MyNotificationsPage;