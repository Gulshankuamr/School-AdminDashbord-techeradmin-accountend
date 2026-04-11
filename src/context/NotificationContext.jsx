// context/NotificationContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES (Firebase Push added):
//   • messaging + onMessage imported from firebaseConfig
//   • foreground push → addPushNotification() se bell badge update
//   • pushNotifications state alag rakha (in-app toasts ke liye)
//   • baaki sab same — markAsRead, markAllAsRead, polling, etc.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { notificationService } from '../services/notificationService/notificationService'
import { messaging, onMessage } from '../config/firebaseConfig'  // 🔥 NEW

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}

// ── Normalise one item from getMyNotifications ────────────────────────────────
const normalise = (n) => {
  if (!n || typeof n !== 'object') return null
  return {
    id:          n.notification_id ?? n.id,
    title:       n.title           ?? 'No Title',
    message:     n.description     ?? n.message   ?? '',
    createdAt:   n.created_at      ?? n.createdAt ?? new Date().toISOString(),
    status:      n.status,
    read:        n.is_read === 1   || n.is_read === true || n.read === true,
    readAt:      n.read_at         ?? null,
    senderName:  n.sender_name     ?? '',
    senderRole:  n.sender_role     ?? '',
    senderEmail: n.sender_email    ?? '',
  }
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()

  const [notifications,     setNotifications]     = useState([])
  const [unreadCount,       setUnreadCount]       = useState(0)
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState(null)

  // 🔥 NEW: foreground push notifications (in-app toast ke liye)
  const [pushNotifications, setPushNotifications] = useState([])

  // ── Fetch recipient inbox ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async ({ page = 1, limit = 50, is_read } = {}) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res  = await notificationService.getMyNotifications({ page, limit, is_read })
      const data = res?.data ?? {}
      const raw  = Array.isArray(data.notifications) ? data.notifications : []
      const normalised = raw.map(normalise).filter(Boolean)
      setNotifications(normalised)
      setUnreadCount(data.unread_count ?? 0)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // ── Refresh only unread count (lightweight poll) ───────────────────────────
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const res   = await notificationService.getMyNotifications({ page: 1, limit: 1 })
      const count = res?.data?.unread_count ?? 0
      setUnreadCount(count)
    } catch {
      // silent
    }
  }, [user])

  // ── Mark single as read ────────────────────────────────────────────────────
  const markAsRead = useCallback(async (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await notificationService.markAllAsRead()
      await refreshUnreadCount()
    } catch (err) {
      console.error('Background markAllAsRead failed:', err)
    }
  }, [refreshUnreadCount])

  // ── Mark ALL as read ───────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
      throw err
    }
  }, [])

  // ── Delete notification ────────────────────────────────────────────────────
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
        await refreshUnreadCount()
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      throw err
    }
  }, [notifications, refreshUnreadCount])

  // ── Initial load + 30s poll ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    fetchNotifications()
    const interval = setInterval(refreshUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [user, fetchNotifications, refreshUnreadCount])

  // ── 🔥 NEW: Firebase foreground push listener ──────────────────────────────
  // App khuli ho tab push aaye → bell badge update + in-app toast
  useEffect(() => {
    if (!user) return

    let unsubscribe = null

    try {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground push received:', payload)

        const newPush = {
          id:        Date.now(),
          title:     payload.notification?.title || 'New Notification',
          message:   payload.notification?.body  || '',
          createdAt: new Date().toISOString(),
          read:      false,
        }

        // In-app push toast list mein add karo
        setPushNotifications(prev => [newPush, ...prev])

        // 🔔 Navbar badge increment karo (server se re-fetch)
        refreshUnreadCount()

        // Notification list bhi refresh karo
        fetchNotifications()
      })
    } catch (err) {
      // Agar firebase messaging browser mein support nahi karta (e.g. Safari)
      console.warn('Firebase messaging not supported or failed:', err)
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [user, refreshUnreadCount, fetchNotifications])

  // ── 🔥 NEW: Push toast dismiss karo ───────────────────────────────────────
  const dismissPushNotification = useCallback((id) => {
    setPushNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    refreshUnreadCount,
    refetch: fetchNotifications,
    // 🔥 NEW
    pushNotifications,
    dismissPushNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* 🔥 NEW: Foreground push toast UI */}
      <PushToastContainer
        toasts={pushNotifications}
        onDismiss={dismissPushNotification}
      />
    </NotificationContext.Provider>
  )
}

// ── 🔥 NEW: Push Toast UI Component ───────────────────────────────────────────
// Jab app khuli ho aur push aaye → right corner mein toast dikhega
const PushToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null

  return (
    <div
      style={{
        position:  'fixed',
        top:       '80px',
        right:     '20px',
        zIndex:    99999,
        display:   'flex',
        flexDirection: 'column',
        gap:       '10px',
        maxWidth:  '340px',
        width:     '100%',
      }}
    >
      {toasts.slice(0, 3).map((toast) => (
        <PushToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

const PushToast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 6000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      style={{
        background:   '#ffffff',
        border:       '1px solid #e5e7eb',
        borderLeft:   '4px solid #f97316',
        borderRadius: '12px',
        padding:      '14px 16px',
        boxShadow:    '0 10px 40px rgba(0,0,0,0.12)',
        display:      'flex',
        alignItems:   'flex-start',
        gap:          '12px',
        animation:    'pushToastIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      {/* Bell icon */}
      <div
        style={{
          width:           '36px',
          height:          '36px',
          background:      '#fff7ed',
          borderRadius:    '8px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
          fontSize:        '18px',
        }}
      >
        🔔
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '13px', color: '#111827', margin: 0, lineHeight: 1.4 }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '3px 0 0', lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {toast.message}
          </p>
        )}
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
          Just now
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          padding:    '2px',
          color:      '#9ca3af',
          fontSize:   '16px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes pushToastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}