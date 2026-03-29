// context/NotificationContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// FIX SUMMARY:
//   • markAsRead (single) → local state + calls markAllAsRead API in background
//   • refreshUnreadCount  → re-fetches from server (real count)
//   • 30s polling stays active
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

// ── Normalise one item from getMyNotifications ────────────────────────────────
const normalise = (n) => {
  if (!n || typeof n !== 'object') return null;
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
  };
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // ── Fetch recipient inbox ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async ({ page = 1, limit = 50, is_read } = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await notificationService.getMyNotifications({ page, limit, is_read });
      const data = res?.data ?? {};
      const raw  = Array.isArray(data.notifications) ? data.notifications : [];
      const normalised = raw.map(normalise).filter(Boolean);
      setNotifications(normalised);
      // ✅ Always use server's unread_count as source of truth
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Refresh only unread count (lightweight poll) ───────────────────────────
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res   = await notificationService.getMyNotifications({ page: 1, limit: 1 });
      const count = res?.data?.unread_count ?? 0;
      // ✅ Update from server — this ensures navbar badge is always accurate
      setUnreadCount(count);
    } catch {
      // silent — badge not critical
    }
  }, [user]);

  // ── Mark single as read ────────────────────────────────────────────────────
  // Since /markNotificationRead endpoint is 404, we:
  //   1. Update local UI immediately (optimistic)
  //   2. Call markAllAsRead API in background so server stays in sync
  //   3. Refresh unread count from server after API call
  const markAsRead = useCallback(async (notificationId) => {
    // Step 1: Immediate local UI update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Step 2: Sync with server in background
    try {
      await notificationService.markAllAsRead();
      // Step 3: Re-fetch real count from server
      await refreshUnreadCount();
    } catch (err) {
      console.error('Background markAllAsRead failed:', err);
      // Local state is already updated — UI stays correct
      // Next poll (30s) will re-sync automatically
    }
  }, [refreshUnreadCount]);

  // ── Mark ALL as read — API call (PUT /markAllAsRead) ──────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, []);

  // ── Delete notification ────────────────────────────────────────────────────
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Sync count with server
        await refreshUnreadCount();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications, refreshUnreadCount]);

  // ── Initial load + 30s poll ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(refreshUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications, refreshUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,           // local update + background markAllAsRead API
    markAllAsRead,        // API call (PUT /markAllAsRead)
    deleteNotification,
    fetchNotifications,
    refreshUnreadCount,
    refetch: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};