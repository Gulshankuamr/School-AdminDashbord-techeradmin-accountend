import { API_BASE_URL, getAuthToken } from "../api"

// ── GET ALL CLASSES ───────────────────────────────────────────────────────────
const getClasses = async () => {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/schooladmin/getAllClasses`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch classes')
  return data.data || []
}

// ── GET SECTIONS BY CLASS ─────────────────────────────────────────────────────
const getSections = async (classId) => {
  const token = getAuthToken()
  const res = await fetch(
    `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch sections')
  return data.data || []
}

// ── GET STUDENTS BY CLASS + SECTION ──────────────────────────────────────────
const getStudents = async (classId, sectionId) => {
  const token = getAuthToken()
  const res = await fetch(
    `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId?class_id=${classId}&section_id=${sectionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch students')
  return data.data || []
}

// ── GET ALL ROUTES ────────────────────────────────────────────────────────────
const getRoutes = async () => {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/schooladmin/getRoutes`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch routes')
  return data.data || []
}

// ── GET STOPS BY ROUTE ────────────────────────────────────────────────────────
const getStopsByRoute = async (routeId) => {
  const token = getAuthToken()
  const res = await fetch(
    `${API_BASE_URL}/schooladmin/getStops?transport_route_id=${routeId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch stops')
  return data.data || []
}

// ── ASSIGN TRANSPORT TO STUDENT ───────────────────────────────────────────────
const assignTransport = async (payload) => {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/schooladmin/assignStudentTransport`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      student_id:              payload.student_id,
      transport_route_id:      payload.transport_route_id,
      transport_route_stop_id: payload.transport_route_stop_id,
      academic_year:           payload.academic_year,
      academic_year_end:       payload.academic_year_end,
      assigned_on:             payload.assigned_on,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to assign transport')
  return data
}

// ── GET STUDENT FEES / TRANSPORT DETAILS ─────────────────────────────────────
const getStudentFees = async (studentId, academicYear) => {
  const token = getAuthToken()
  const res = await fetch(
    `${API_BASE_URL}/schooladmin/getStudentFees?student_id=${studentId}&academic_year=${academicYear}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Not found')
  return data.data || null
}

// ── GET STUDENT TRANSPORT (preview) ──────────────────────────────────────────
const getStudentTransport = async (studentId, academicYear) => {
  const token = getAuthToken()
  const res = await fetch(
    `${API_BASE_URL}/schooladmin/getStudentTransport?student_id=${studentId}&academic_year=${academicYear}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Not found')
  return data.data || null
}

// ── GET ALL ASSIGNMENTS ───────────────────────────────────────────────────────
const getAllAssignments = async () => {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/schooladmin/getAllStudentTransport`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch assignments')
  return data.data || []
}

// ── REMOVE TRANSPORT ASSIGNMENT ───────────────────────────────────────────────
const removeAssignment = async (assignmentId) => {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/schooladmin/removeStudentTransport`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ assignment_id: assignmentId }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to remove assignment')
  return data
}

// ── DISCONTINUE STUDENT TRANSPORT ─────────────────────────────────────────────
// PUT /api/schooladmin/discontinueStudentTransport
// Payload: { student_id, academic_year, discontinued_on, discontinue_reason }
const discontinueStudentTransport = async (payload) => {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}/schooladmin/discontinueStudentTransport`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      student_id:          payload.student_id,
      academic_year:       payload.academic_year,
      discontinued_on:     payload.discontinued_on,
      discontinue_reason:  payload.discontinue_reason,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to discontinue transport')
  return data
}

// ── GET ALL TRANSPORT STUDENTS BY ACADEMIC YEAR ───────────────────────────────
// GET /api/schooladmin/getAllTransportStudents?academic_year=2026-27
const getTransportStudentsByYear = async (academicYear) => {
  const token = getAuthToken()
  const res = await fetch(
    `${API_BASE_URL}/schooladmin/getAllTransportStudents?academic_year=${academicYear}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch transport students')
  return data.data || []
}

// ── NAMED EXPORT ──────────────────────────────────────────────────────────────
export const studentTransportService = {
  getClasses,
  getSections,
  getStudents,
  getRoutes,
  getStopsByRoute,
  assignTransport,
  getStudentFees,
  getStudentTransport,
  getAllAssignments,
  removeAssignment,
  discontinueStudentTransport,
  getTransportStudentsByYear,
}