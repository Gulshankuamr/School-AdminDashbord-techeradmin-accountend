// src/services/subjectService/subjectService.js
import { API_BASE_URL, getAuthToken } from "../api.js"

export const subjectService = {
  // ===============================
  // 1️⃣ GET ALL SUBJECTS ✅
  // ===============================
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('GET ALL SUBJECTS RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects')
    }

    return data.data || []
  },

  // ===============================
  // 2️⃣ GET SUBJECT BY ID ✅
  // ===============================
  getSubjectById: async (subjectId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('SUBJECT BY ID RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects')
    }

    const subject = (data.data || []).find(s =>
      String(s.subject_id) === String(subjectId) ||
      s.subject_id === parseInt(subjectId)
    )

    if (!subject) {
      throw new Error('Subject not found')
    }

    return subject
  },

  // ===============================
  // 3️⃣ ADD SUBJECT ✅
  // ===============================
  addSubject: async (subjectData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createSubject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_name: subjectData.subject_name,
          assessment_model: subjectData.assessment_model,
        }),
      }
    )

    const data = await response.json()
    console.log('ADD SUBJECT RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create subject')
    }

    return data
  },

  // ===============================
  // 4️⃣ UPDATE SUBJECT ✅
  // ===============================
  updateSubject: async (subjectId, subjectData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const payload = {
      subject_id:       parseInt(subjectId),
      subject_name:     subjectData.subject_name,
      assessment_model: subjectData.assessment_model,
    }

    console.log('UPDATE SUBJECT PAYLOAD:', payload)

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateSubject`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()
    console.log('UPDATE SUBJECT RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update subject')
    }

    // ✅ FIX: Always return the updated fields so the UI can sync local state
    // regardless of whether the API returns the updated object or not
    return {
      ...data,
      data: data.data || {
        subject_id:       parseInt(subjectId),
        subject_name:     subjectData.subject_name,
        assessment_model: subjectData.assessment_model,
      },
    }
  },

  // ===============================
  // 5️⃣ DELETE SUBJECT ✅
  // ===============================
  deleteSubject: async (subjectId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteSubject`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: parseInt(subjectId),
        }),
      }
    )

    const data = await response.json()
    console.log('DELETE SUBJECT RESPONSE:', data)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete subject')
    }

    return data
  },

  // ===============================
  // 6️⃣ SEARCH SUBJECTS ✅ (Optional)
  // ===============================
  searchSubjects: async (searchTerm) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects')
    }

    const allSubjects = data.data || []

    if (searchTerm) {
      return allSubjects.filter(subject =>
        subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(subject.subject_id).includes(searchTerm) ||
        (subject.assessment_model || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return allSubjects
  },
}