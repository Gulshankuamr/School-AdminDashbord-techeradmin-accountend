import { API_BASE_URL, getAuthToken } from '../api'

// ─────────────────────────────────────────────────────────────────────────────
// markExameService — all exam-related API calls (FIXED)
// ─────────────────────────────────────────────────────────────────────────────

const markExameService = {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. GET EXAMS LIST
  //    GET /api/schooladmin/getExams
  // ═══════════════════════════════════════════════════════════════════════════
  getExams: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/getExams`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`getExams failed: ${response.status}`)
    const data = await response.json()
    console.log('📅 getExams:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch exams')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. GET EXAM TIMETABLE
  //    GET /api/schooladmin/getExamTimetable?exam_id=&class_id=&section_id=
  // ═══════════════════════════════════════════════════════════════════════════
  getExamTimetable: async (examId, classId, sectionId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const params = new URLSearchParams()
    if (examId)    params.append('exam_id',    examId)
    if (classId)   params.append('class_id',   classId)
    if (sectionId) params.append('section_id', sectionId)
    const qs = params.toString()
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExamTimetable${qs ? `?${qs}` : ''}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error(`getExamTimetable failed: ${response.status}`)
    const data = await response.json()
    console.log('🗓️ getExamTimetable:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch timetable')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. GET ALL CLASSES
  //    GET /api/schooladmin/getAllClasses  (fallback: getAllClassList)
  // ═══════════════════════════════════════════════════════════════════════════
  getAllClassList: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const endpoints = [
      `${API_BASE_URL}/schooladmin/getAllClasses`,
      `${API_BASE_URL}/schooladmin/getAllClassList`,
    ]
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          if (data?.success) {
            console.log('🏫 getAllClasses:', data)
            return data
          }
        }
      } catch (_) {}
    }
    throw new Error('Failed to fetch classes')
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. GET ALL SECTIONS (by class_id)
  //    GET /api/schooladmin/getAllSections?class_id=
  // ═══════════════════════════════════════════════════════════════════════════
  getAllSections: async (classId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error(`getAllSections failed: ${response.status}`)
    const data = await response.json()
    console.log('📋 getAllSections:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch sections')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GET ALL SUBJECTS
  //    GET /api/schooladmin/getAllSubjects
  // ═══════════════════════════════════════════════════════════════════════════
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllSubjects`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`getAllSubjects failed: ${response.status}`)
    const data = await response.json()
    console.log('📚 getAllSubjects:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch subjects')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. GET STUDENTS BY CLASS + SECTION
  //    GET /api/schooladmin/getTotalStudentsListBySchoolId?class_id=&section_id=
  // ═══════════════════════════════════════════════════════════════════════════
  getStudentsByClass: async (classId, sectionId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const params = new URLSearchParams()
    params.append('class_id', classId)
    if (sectionId) params.append('section_id', sectionId)

    const url = `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId?${params.toString()}`
    console.log('👨‍🎓 fetching students from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`getStudents failed: ${response.status}`)
    const data = await response.json()
    console.log('👨‍🎓 students data:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch students')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. GET EXAM MARKS LIST (MarksList page)
  //    GET /api/schooladmin/getExamMarks?exam_id=&class_id=&section_id=&subject_id=
  //    ✅ FIX: timetable_id + student_id bhi support karta hai
  // ═══════════════════════════════════════════════════════════════════════════
  getExamMarks: async (params = {}) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const query = new URLSearchParams()
    if (params.exam_id)      query.append('exam_id',      params.exam_id)
    if (params.class_id)     query.append('class_id',     params.class_id)
    if (params.section_id)   query.append('section_id',   params.section_id)
    if (params.subject_id)   query.append('subject_id',   params.subject_id)
    if (params.timetable_id) query.append('timetable_id', params.timetable_id)
    if (params.student_id)   query.append('student_id',   params.student_id)
    const qs = query.toString()
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExamMarks${qs ? `?${qs}` : ''}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) throw new Error(`getExamMarks failed: ${response.status}`)
    const data = await response.json()
    console.log('📊 getExamMarks:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch marks')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CREATE EXAM MARKS (single student)
  //    POST /api/schooladmin/createExamMarks
  //    Body: { timetable_id, student_id, marks_obtained, is_absent, remarks }
  // ═══════════════════════════════════════════════════════════════════════════
  createExamMarks: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const response = await fetch(`${API_BASE_URL}/schooladmin/createExamMarks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error(`createExamMarks failed: ${response.status}`)
    const data = await response.json()
    console.log('✅ createExamMarks:', data)
    if (!data?.success) throw new Error(data?.message || 'Failed to save marks')
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. SAVE ALL MARKS (batch loop per student)
  //    ✅ FIX: marks_obtained properly Number cast kiya
  // ═══════════════════════════════════════════════════════════════════════════
  saveAllMarks: async (studentsArray, timetableId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const results = []
    const errors  = []
    for (const student of studentsArray) {
      try {
        const payload = {
          timetable_id:   Number(timetableId),
          student_id:     Number(student.student_id || student.id),
          marks_obtained: student.is_absent ? 0 : Number(student.marks || 0),
          is_absent:      student.is_absent ? 1 : 0,
          remarks:        student.remark || '',
        }
        const response = await fetch(`${API_BASE_URL}/schooladmin/createExamMarks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        results.push({ studentId: student.id, success: true, data })
      } catch (err) {
        console.error(`❌ Student ${student.id}:`, err)
        errors.push({ studentId: student.id, error: err.message })
      }
    }
    return {
      success: errors.length === 0,
      results,
      errors,
      message: errors.length === 0
        ? `All ${results.length} marks saved successfully`
        : `Saved ${results.length}, Failed ${errors.length}`,
    }
  },
}

export { markExameService }
export default markExameService