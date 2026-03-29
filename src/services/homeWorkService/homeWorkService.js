// src/services/homeWorkService/homeWorkService.js
import { API_BASE_URL, getAuthToken } from '../api'

// ── Safe JSON parse — never throws ───────────────────────────
const safeJson = async (res) => {
  const text = await res.text()
  if (!text.trim()) return { success: res.ok, message: res.ok ? 'OK' : `Server error (${res.status})` }
  try {
    return JSON.parse(text)
  } catch {
    return { success: false, message: `Invalid JSON response (${res.status})` }
  }
}

// ── Auth header helper ────────────────────────────────────────
const authHeader = () => {
  const token = getAuthToken()
  if (!token) throw new Error('Authentication token missing. Please log in again.')
  return { Authorization: `Bearer ${token}` }
}

export const homeWorkService = {

  // ── 1. GET ALL CLASSES ──────────────────────────────────────
  getAllClasses: async () => {
    const res  = await fetch(`${API_BASE_URL}/schooladmin/getAllClassList`, {
      headers: authHeader(),
    })
    const data = await safeJson(res)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch classes')
    return data   // { success, data: [{ class_id, class_name }] }
  },

  // ── 2. GET SECTIONS BY CLASS ────────────────────────────────
  getAllSections: async (classId) => {
    const res  = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      { headers: authHeader() }
    )
    const data = await safeJson(res)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch sections')
    return data   // { success, data: [{ section_id, section_name }] }
  },

  // ── 3. GET ALL SUBJECTS ─────────────────────────────────────
  getAllSubjects: async () => {
    const res  = await fetch(`${API_BASE_URL}/schooladmin/getAllSubjects`, {
      headers: authHeader(),
    })
    const data = await safeJson(res)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch subjects')
    return data   // { success, data: [{ subject_id, subject_name }] }
  },

  // ── 4. GET ALL HOMEWORKS ────────────────────────────────────
  getAllHomeworks: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.class_id)   params.append('class_id',   filters.class_id)
    if (filters.subject_id) params.append('subject_id', filters.subject_id)
    if (filters.status)     params.append('status',     filters.status)
    const qs  = params.toString()
    const url = `${API_BASE_URL}/schooladmin/getHomeworks${qs ? '?' + qs : ''}`
    const res  = await fetch(url, { headers: authHeader() })
    const data = await safeJson(res)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch homeworks')
    return data   // { success, data: [...] }
  },

  // ── 5. GET HOMEWORK BY ID ───────────────────────────────────
  getHomeworkById: async (homeworkId) => {
    const res  = await fetch(
      `${API_BASE_URL}/schooladmin/getHomeworkById?homework_id=${homeworkId}`,
      { headers: authHeader() }
    )
    const data = await safeJson(res)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch homework details')
    return data   // { success, data: { ...hw, students: [...], summary: {...} } }
  },

  // ── 6. CREATE HOMEWORK ──────────────────────────────────────
  // API POST body (form-data):
  //   class_id, section_id, subject_id, description, due_date, attachment (file, optional)
  // API response: { success: true, data: { homework_id: 55, total_students: 3 } }
  createHomework: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/schooladmin/createTeacherHomework`, {
      method:  'POST',
      headers: authHeader(),   // ✅ NO Content-Type → browser sets multipart/form-data boundary automatically
      body:    formData,
    })
    const data = await safeJson(res)

    // ✅ KEY FIX: only throw if truly failed
    // Some APIs return 200 with success:true — trust that over res.ok alone
    if (data?.success === true) {
      return data   // ✅ { success: true, data: { homework_id, total_students } }
    }

    // data.success is false OR missing
    const msg = data?.message || data?.error || data?.msg || `Request failed (${res.status})`
    throw new Error(msg)
  },

  // ── 7. UPDATE HOMEWORK ──────────────────────────────────────
  updateHomework: async (formData) => {
    const res  = await fetch(`${API_BASE_URL}/schooladmin/updateHomework`, {
      method:  'POST',
      headers: authHeader(),
      body:    formData,
    })
    const data = await safeJson(res)

    if (data?.success === true) {
      return data
    }
    const msg = data?.message || data?.error || data?.msg || `Update failed (${res.status})`
    throw new Error(msg)
  },

  // ── 8. DELETE HOMEWORK (if needed later) ───────────────────
  deleteHomework: async (homeworkId) => {
    const res  = await fetch(`${API_BASE_URL}/schooladmin/deleteHomework`, {
      method:  'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ homework_id: homeworkId }),
    })
    const data = await safeJson(res)
    if (data?.success === true) return data
    throw new Error(data?.message || 'Delete failed')
  },
}