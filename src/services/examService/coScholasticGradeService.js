import { API_BASE_URL, getAuthToken } from '../api'

export const coScholasticGradeService = {

  // ════════════════════════════════════════════════════════════════════
  // 1️⃣  GET CO-SCHOLASTIC GRADES
  // ════════════════════════════════════════════════════════════════════
  getCoScholasticGrades: async ({ student_id, class_id, section_id, academic_year, term } = {}) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const params = new URLSearchParams()
    if (student_id)    params.append('student_id',    student_id)
    if (class_id)      params.append('class_id',      class_id)
    if (section_id)    params.append('section_id',    section_id)
    if (academic_year) params.append('academic_year', academic_year)
    if (term)          params.append('term',          term)
    const res  = await fetch(`${API_BASE_URL}/schooladmin/getCoScholasticGrades?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || data.success !== true) throw new Error(data?.message || 'Failed to fetch grades')
    return data
  },

  // ════════════════════════════════════════════════════════════════════
  // 2️⃣  CREATE
  // ════════════════════════════════════════════════════════════════════
  createCoScholasticGrade: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res  = await fetch(`${API_BASE_URL}/schooladmin/createCoScholasticGrade`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok || data.success !== true) throw new Error(data.message || 'Failed to create grade')
    return data
  },

  // ════════════════════════════════════════════════════════════════════
  // 3️⃣  UPDATE
  // ════════════════════════════════════════════════════════════════════
  updateCoScholasticGrade: async (co_scholastic_grades_id, newGrade) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res  = await fetch(`${API_BASE_URL}/schooladmin/updateCoScholasticGrade`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ grade_id: co_scholastic_grades_id, grade: newGrade }),
    })
    const data = await res.json()
    if (!res.ok || data.success !== true) throw new Error(data.message || 'Failed to update grade')
    return data
  },

  // ════════════════════════════════════════════════════════════════════
  // 4️⃣  DELETE
  // ════════════════════════════════════════════════════════════════════
  deleteCoScholasticGrade: async (co_scholastic_grades_id) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res  = await fetch(`${API_BASE_URL}/schooladmin/deleteCoScholasticGrade`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ grade_id: co_scholastic_grades_id }),
    })
    const data = await res.json()
    if (!res.ok || data.success !== true) throw new Error(data?.message || 'Failed to delete grade')
    return data
  },

  // ════════════════════════════════════════════════════════════════════
  // 5️⃣  GET ACADEMIC YEARS  ✅ NEW
  //  GET /schoolAdmin/getAcademicYears
  //  Response: { success, data: [{ academic_year_id, year_name, ... }] }
  // ════════════════════════════════════════════════════════════════════
  getAcademicYears: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res  = await fetch(`${API_BASE_URL}/schoolAdmin/getAcademicYears`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || data.success !== true) throw new Error(data?.message || 'Failed to fetch academic years')
    // Return only year_name strings: ["2026-27", ...]
    return (data.data || []).map(item => item.year_name)
  },
}