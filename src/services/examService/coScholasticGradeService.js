import { API_BASE_URL, getAuthToken } from '../api'

export const coScholasticGradeService = {

  // ════════════════════════════════════════════════════════════════════
  // 1️⃣  GET CO-SCHOLASTIC GRADES
  //  GET /schooladmin/getCoScholasticGrades?student_id=264&academic_year=2026-27
  //  Response: { success, data: [{
  //    co_scholastic_grades_id, school_id, student_id, subject_id,
  //    term, grade, academic_year, subject_name, student_name, roll_no
  //  }] }
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
    return data   // data.data[] is the array
  },

  // ════════════════════════════════════════════════════════════════════
  // 2️⃣  CREATE
  //  POST /schooladmin/createCoScholasticGrade
  //  Body: { student_id, subject_id, term, grade, academic_year }
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
  //  PUT /schooladmin/updateCoScholasticGrade
  //  Body: { grade_id: <co_scholastic_grades_id>, grade: "A1" }
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
  //  DELETE /schooladmin/deleteCoScholasticGrade
  //  Body: { grade_id: <co_scholastic_grades_id> }
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
}