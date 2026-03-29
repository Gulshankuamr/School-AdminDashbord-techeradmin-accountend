import { API_BASE_URL, getAuthToken } from '../api'

export const classService = {

  // ===============================
  // 1️⃣ GET ALL CLASSES
  // ===============================

getAllClasses: async () => {
  const token = getAuthToken()
  if (!token) throw new Error('Token missing')

  try {
    // Remove timestamp - let's debug
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllClasses`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // Remove cache busting to see actual data
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 getAllClasses raw response:', data) // Debug log

    if (!data || data.success !== true) {
      throw new Error(data?.message || 'Failed to fetch classes')
    }

    // Check what data is returned
    console.log('📊 Classes data structure:', {
      hasData: !!data.data,
      isArray: Array.isArray(data.data),
      length: data.data?.length,
      firstItem: data.data?.[0]
    })

    return data
  } catch (error) {
    console.error('Get all classes error:', error)
    throw error
  }
},

  // ===============================
  // 2️⃣ CREATE CLASS
  // ===============================
  createClass: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createClass`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Failed to create class')
    }

    return data
  },

  // ===============================
  // 3️⃣ UPDATE CLASS
  // ===============================
  updateClass: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateClass`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Failed to update class')
    }

    return data
  },

 // ===============================
// 4️⃣ DELETE CLASS - IMPROVED VERSION
// ===============================
deleteClass: async (classId) => {
  const token = getAuthToken()
  if (!token) throw new Error('Token missing')

  try {
    // DELETE request with body
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteClass`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: classId,
        }),
      }
    )

    // First check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Try to parse JSON
    let data;
    try {
      data = await response.json()
    } catch (parseError) {
      throw new Error('Invalid JSON response from server')
    }

    // Check for success in response
    if (!data || data.success !== true) {
      throw new Error(data?.message || 'Failed to delete class')
    }

    return data
  } catch (error) {
    console.error('Delete class error:', error)
    throw error
  }
},
}