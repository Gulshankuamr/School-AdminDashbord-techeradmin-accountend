// services/notificationService/notificationService.js
import { API_BASE_URL, getAuthToken } from '../api';

export const notificationService = {

  // ═══════════════════════════════════════════════════════════════════════════
  // ✉️  SENDER SIDE — Admin / Teacher
  // ═══════════════════════════════════════════════════════════════════════════

  // 1️⃣ CREATE NOTIFICATION
  // POST /schooladmin/createNotification
  // Body: { title, description, targets: [{ target_type, class_id?, section_id?, role? }] }
  createNotification: async (payload) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const response = await fetch(`${API_BASE_URL}/schooladmin/createNotification`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // 2️⃣ GET SENT NOTIFICATIONS — Admin sent box
  // GET /schooladmin/getSentNotifications
  // Response: { success, data: [{ notification_id, title, description, status, created_at, recipients_count, read_count }] }
  getSentNotifications: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const response = await fetch(`${API_BASE_URL}/schooladmin/getSentNotifications`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // 3️⃣ GET NOTIFICATION BY ID — Sender view
  // POST /schooladmin/getNotificationById
  // Body: { notification_id }
  getNotificationById: async (notificationId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const response = await fetch(`${API_BASE_URL}/schooladmin/getNotificationById`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // 4️⃣ GET NOTIFICATION RECIPIENTS — Kisne padhi, kisne nahi
  // GET /schooladmin/getNotificationRecipients/:notificationId?page=1&limit=50
  // Response: { success, data: [{ user_id, name, email, role, is_read, read_at }], pagination: {...} }
  getNotificationRecipients: async (notificationId, { page = 1, limit = 50 } = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const params = new URLSearchParams({ page, limit });
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getNotificationRecipients/${notificationId}?${params.toString()}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // ⚠️  markAsRead (single) — REMOVED
  //     Endpoint /schooladmin/markNotificationRead returns 404
  //     Ab sirf local state update hoga, no API call
  //     markAllAsRead tab bhi kaam karta hai (bulk read)

  // 5️⃣ MARK ALL AS READ
  // PUT /schooladmin/markAllAsRead — no body needed
  // Response: { success: true, message: "1 notifications marked as read" }
  markAllAsRead: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const response = await fetch(`${API_BASE_URL}/schooladmin/markAllAsRead`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // 6️⃣ DELETE NOTIFICATION
  // DELETE /schooladmin/deleteNotification
  // Body: { notification_ids: [id], is_all: 0 }  (is_all: 1 = delete all)
  deleteNotification: async (notificationId, isAll = 0) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const ids = Array.isArray(notificationId) ? notificationId : [notificationId];
    const response = await fetch(`${API_BASE_URL}/schooladmin/deleteNotification`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: ids, is_all: isAll }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 📥  RECIPIENT SIDE — Logged-in user ka inbox
  // ═══════════════════════════════════════════════════════════════════════════

  // 7️⃣ GET MY NOTIFICATIONS — Recipient inbox
  // GET /schooladmin/getMyNotifications
  // Params: page, limit, is_read (0=unread/1=read), notification_id
  // Response: { success, data: { unread_count, notifications: [{ notification_id, title,
  //             description, created_at, status, is_read, read_at,
  //             sender_name, sender_role, sender_email }] } }
  getMyNotifications: async ({ page = 1, limit = 20, is_read, notification_id } = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const params = new URLSearchParams({ page, limit });
    if (is_read !== undefined && is_read !== null) params.append('is_read', is_read);
    if (notification_id) params.append('notification_id', notification_id);
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getMyNotifications?${params.toString()}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋  FORM DROPDOWNS — CreateNotification page ke liye
  // ═══════════════════════════════════════════════════════════════════════════

  // 8️⃣ GET ALL CLASSES
  // GET /schooladmin/getAllClassList
  // Response: { success: true, data: [{ class_id, class_name }] }
  getAllClasses: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllClassList`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // 9️⃣ GET SECTIONS BY CLASS ID
  // GET /schooladmin/getAllSections?class_id=:classId
  // Response: { success: true, data: [{ section_id, class_id, section_name, class_name }] }
  getSectionsByClass: async (classId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },
};