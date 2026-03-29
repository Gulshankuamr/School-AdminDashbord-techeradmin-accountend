import { API_BASE_URL, getAuthToken } from "../api.js"

export const sectionService = {
  // ===============================
  // 1️⃣ GET ALL SECTIONS (OPTIONAL CLASS ID FILTER)
  // ===============================
  getAllSections: async (classId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      // Build URL with optional query parameter
      const url = new URL(`${API_BASE_URL}/schooladmin/getAllSections`)
      // Only add class_id filter if it's provided and not empty/null
      if (classId && classId !== '' && classId !== 'all') {
        url.searchParams.append('class_id', classId)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('GET ALL SECTIONS RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Could not fetch sections')
      }

      return data
    } catch (error) {
      console.error('Get all sections error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ CREATE SECTION
  // ===============================
  createSection: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createSection`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()
    console.log('CREATE SECTION RESPONSE:', data)

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Section not created')
    }

    return data
  },

  // ===============================
  // 3️⃣ UPDATE SECTION - FIXED VERSION
  // ===============================
  updateSection: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateSection`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('UPDATE SECTION RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to update section')
      }

      return data
    } catch (error) {
      console.error('Update section error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ DELETE SECTION - FIXED VERSION
  // ===============================
  deleteSection: async (sectionId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteSection`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section_id: sectionId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }

      console.log('DELETE SECTION RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to delete section')
      }

      return data
    } catch (error) {
      console.error('Delete section error:', error)
      throw error
    }
  },

  // ===============================
  // 5️⃣ GET ALL CLASSES (FOR DROPDOWN)
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllClassList`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('GET ALL CLASS LIST RESPONSE:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Could not fetch classes')
      }

      return data
    } catch (error) {
      console.error('Get all classes error:', error)
      throw error
    }
  }
}