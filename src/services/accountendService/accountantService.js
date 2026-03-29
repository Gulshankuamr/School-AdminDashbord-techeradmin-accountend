import { API_BASE_URL, getAuthToken } from '../api.js'

export const accountantService = {

  // ===============================
  // 1️⃣ GET ALL ACCOUNTANTS
  // ===============================
  getAllAccountants: async (page = 1) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalAccountantsListBySchoolId?page=${page}&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error('Could not fetch accountants')
    return data
  },

  // ===============================
  // 2️⃣ GET ACCOUNTANT BY ID — FIXED: query param
  // ===============================
  getAccountById: async (accountantId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAccountantById?accountant_id=${accountantId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const text = await response.text()
        console.error('Server response:', text)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to load accountant data')
      }

      // ✅ FIXED: Return full response object with data property
      return data
    } catch (error) {
      console.error('Error in getAccountById:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ ADD ACCOUNTANT
  // ===============================
  addAccountant: async (accountantData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()

    formData.append('name', accountantData.name || '')
    formData.append('user_email', accountantData.user_email || '')
    formData.append('password', accountantData.password || '')
    formData.append('qualification', accountantData.qualification || '')

    if (accountantData.mobile_number) formData.append('mobile_number', accountantData.mobile_number)
    if (accountantData.address) formData.append('address', accountantData.address)
    if (accountantData.father_name) formData.append('father_name', accountantData.father_name)
    if (accountantData.mother_name) formData.append('mother_name', accountantData.mother_name)
    if (accountantData.experience_years) formData.append('experience_years', accountantData.experience_years)

    if (accountantData.accountant_photo instanceof File) {
      formData.append('accountant_photo', accountantData.accountant_photo)
    }
    if (accountantData.aadhar_card instanceof File) {
      formData.append('aadhar_card', accountantData.aadhar_card)
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerAccountant`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    const data = await response.json()
    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Accountant not added')
    }

    return data
  },

  // ===============================
  // 4️⃣ UPDATE ACCOUNTANT
  // ===============================
  updateAccountant: async (accountantId, accountantData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()

    formData.append('accountant_id', String(accountantId))
    formData.append('name', accountantData.name || '')
    formData.append('user_email', accountantData.user_email || '')
    formData.append('qualification', accountantData.qualification || '')
    formData.append('mobile_number', accountantData.mobile_number || '')
    formData.append('address', accountantData.address || '')
    formData.append('father_name', accountantData.father_name || '')
    formData.append('mother_name', accountantData.mother_name || '')
    formData.append('experience_years', accountantData.experience_years || '')

    if (accountantData.password && accountantData.password.trim() !== '') {
      formData.append('password', accountantData.password)
    }

    if (accountantData.accountant_photo instanceof File) {
      formData.append('accountant_photo', accountantData.accountant_photo)
    }

    if (accountantData.aadhar_card instanceof File) {
      formData.append('aadhar_card', accountantData.aadhar_card)
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateAccountant`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Server error response:', text)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Accountant not updated')
    }

    return data
  },

  // ===============================
  // 5️⃣ DELETE ACCOUNTANT
  // ===============================
  deleteAccountant: async (accountantId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteAccountantById`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountant_id: accountantId }),
      }
    )

    const data = await response.json()
    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Accountant not deleted')
    }

    return data
  },
}