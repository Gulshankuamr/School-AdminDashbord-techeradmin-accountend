import { API_BASE_URL, getAuthToken } from "/src/services/api.js"

export const teacherService = {

  // ===============================
  // 1️⃣ GET ALL TEACHERS
  // API: GET /schooladmin/getTotalTeachersListBySchoolId
  // Response: { success: true, data: [...teachers] }
  // ===============================
  getAllTeachers: async (page = 1) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId?page=${page}&limit=10`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // API returns { success: true, data: [...] }
    const teachersList = Array.isArray(data?.data) ? data.data : []

    return {
      data: teachersList,
      pagination: {
        page: page,
        totalPages: Math.ceil(teachersList.length / 10) || 1,
        total: teachersList.length,
      },
    }
  },

  // ===============================
  // 2️⃣ GET TEACHER BY ID
  // API: GET /schooladmin/getTeacherById?teacher_id=54
  // Response: { success: true, data: { teacher_id, school_id, user_id,
  //   qualification, father_name, mother_name, mobile_number, address,
  //   experience_years, joining_date, employee_id, gender, dob,
  //   employment_type, designation, status, created_at, updated_at,
  //   name, user_email, teacher_photo_url, aadhar_card_url } }
  // ===============================
  getTeacherById: async (teacherId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTeacherById?teacher_id=${teacherId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch teacher')
    }

    // API puts ALL fields flat inside result.data
    const d = result.data || {}

    const normalized = {
      teacher_id:       d.teacher_id,
      school_id:        d.school_id,
      user_id:          d.user_id,
      name:             d.name             || '',
      user_email:       d.user_email       || '',
      gender:           d.gender           || '',
      mobile_number:    d.mobile_number    || '',
      address:          d.address          || '',
      qualification:    d.qualification    || '',
      experience_years: d.experience_years ?? '',
      joining_date:     d.joining_date     || '',
      father_name:      d.father_name      || '',
      mother_name:      d.mother_name      || '',
      employee_id:      d.employee_id      || '',
      dob:              d.dob              || '',
      employment_type:  d.employment_type  || '',
      designation:      d.designation      || '',
      status:           d.status,
      created_at:       d.created_at       || '',
      updated_at:       d.updated_at       || '',
      teacher_photo_url: d.teacher_photo_url || null,
      aadhar_card_url:   d.aadhar_card_url   || null,
    }

    console.log('✅ Normalized teacher data:', normalized)
    return normalized
  },

  // ===============================
  // 3️⃣ ADD TEACHER
  // API: POST /schooladmin/registerTeacher (multipart/form-data)
  // Fields: name, user_email, password, qualification, experience_years,
  //         joining_date, mobile_number, address, father_name, mother_name,
  //         gender, employee_id, dob, employment_type, designation,
  //         teacher_photo (file), aadhar_card (file)
  // ===============================
  addTeacher: async (teacherData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    // Validate required fields before sending
    if (!teacherData.employee_id || !String(teacherData.employee_id).trim()) {
      throw new Error('Employee ID is required')
    }
    if (!teacherData.name || !teacherData.user_email || !teacherData.password) {
      throw new Error('Name, email and password are required')
    }

    const formData = new FormData()

    formData.append('name',             teacherData.name.trim())
    formData.append('user_email',       teacherData.user_email.trim())
    formData.append('password',         teacherData.password)
    formData.append('qualification',    teacherData.qualification    || '')
    formData.append('experience_years', teacherData.experience_years || '')
    formData.append('joining_date',     teacherData.joining_date     || '')
    formData.append('mobile_number',    teacherData.mobile_number    || '')
    formData.append('address',          teacherData.address          || '')
    formData.append('father_name',      teacherData.father_name      || '')
    formData.append('mother_name',      teacherData.mother_name      || '')
    formData.append('gender',           teacherData.gender           || '')
    formData.append('employee_id',      String(teacherData.employee_id).trim())
    formData.append('dob',              teacherData.dob              || '')
    formData.append('employment_type',  teacherData.employment_type  || '')
    formData.append('designation',      teacherData.designation      || '')

    if (teacherData.teacher_photo instanceof File) {
      formData.append('teacher_photo', teacherData.teacher_photo)
    }
    if (teacherData.aadhar_card instanceof File) {
      formData.append('aadhar_card', teacherData.aadhar_card)
    }

    console.log('📤 Adding teacher:', Object.fromEntries(formData))

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerTeacher`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type — browser sets it with boundary for FormData
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Failed to add teacher')
    }
    return result
  },

  // ===============================
  // 4️⃣ UPDATE TEACHER
  // API: PUT /schooladmin/updateTeacher (multipart/form-data)
  // Fields: teacher_id, name, user_email, password (optional),
  //         qualification, experience_years, joining_date, mobile_number,
  //         address, father_name, mother_name, gender, employee_id, dob,
  //         employment_type, designation,
  //         teacher_photo (file, optional), aadhar_card (file, optional)
  // ===============================
  updateTeacher: async (teacherId, teacherData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    // Validate required fields before sending
    if (!teacherData.employee_id || !String(teacherData.employee_id).trim()) {
      throw new Error('Employee ID is required')
    }

    const formData = new FormData()

    formData.append('teacher_id',      String(teacherId))
    formData.append('name',            teacherData.name.trim()      || '')
    formData.append('user_email',      teacherData.user_email.trim()|| '')
    formData.append('qualification',   teacherData.qualification    || '')
    formData.append('experience_years',teacherData.experience_years || '')
    formData.append('joining_date',    teacherData.joining_date     || '')
    formData.append('mobile_number',   teacherData.mobile_number    || '')
    formData.append('address',         teacherData.address          || '')
    formData.append('father_name',     teacherData.father_name      || '')
    formData.append('mother_name',     teacherData.mother_name      || '')
    formData.append('gender',          teacherData.gender           || '')
    formData.append('employee_id',     String(teacherData.employee_id).trim())
    formData.append('dob',             teacherData.dob              || '')
    formData.append('employment_type', teacherData.employment_type  || '')
    formData.append('designation',     teacherData.designation      || '')

    // Only send password if user typed a new one
    if (teacherData.password && teacherData.password.trim() !== '') {
      formData.append('password', teacherData.password)
    }

    // Only send files if new ones are selected
    if (teacherData.teacher_photo instanceof File) {
      formData.append('teacher_photo', teacherData.teacher_photo)
    }
    if (teacherData.aadhar_card instanceof File) {
      formData.append('aadhar_card', teacherData.aadhar_card)
    }

    console.log('📤 Updating teacher ID:', teacherId, Object.fromEntries(formData))

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateTeacher`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type — browser sets it with boundary for FormData
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Failed to update teacher')
    }
    return result
  },

  // ===============================
  // 5️⃣ DELETE TEACHER
  // API: DELETE /schooladmin/deleteTeacherById
  // Body: { teacher_id }
  // ===============================
  deleteTeacher: async (teacherId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteTeacherById`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },
}