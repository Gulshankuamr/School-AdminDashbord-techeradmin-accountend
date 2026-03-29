// src/services/feecreateService.js
import { API_BASE_URL, getAuthToken } from '../api'

export const feecreateService = {

  // ===============================
  // 1️⃣ GET ALL FEE HEADS
  // ===============================
  getAllFeeHeads: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn('Token missing, redirecting to login')
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllFeeHeads`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Fee Heads API Response:', data)

      // Better response structure handling
      if (data?.success === true) {
        return data
      } else {
        throw new Error(data?.message || 'Failed to fetch fee heads')
      }
    } catch (error) {
      console.error('Get all fee heads error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllClassList`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Classes API Response:', data)

      if (data?.success === true) {
        return data
      } else {
        throw new Error(data?.message || 'Failed to fetch classes')
      }
    } catch (error) {
      console.error('Get all classes error:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ CREATE FEE
  // ===============================
  createFee: async (payload) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      // Validate required fields
      if (!payload.class_id || !payload.fee_head_id || !payload.base_amount || !payload.fee_frequency || !payload.academic_year) {
        throw new Error('Missing required fields: class_id, fee_head_id, base_amount, fee_frequency, academic_year are required')
      }

      console.log('📤 Create Fee Payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createFee`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }

      console.log('📥 Create Fee Response:', data)

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Fee already exists for this class, fee head, and academic year')
        }
        throw new Error(data?.message || `HTTP error! status: ${response.status}`)
      }

      if (data?.success === true) {
        return data
      } else {
        throw new Error(data?.message || 'Failed to create fee')
      }
    } catch (error) {
      console.error('Create fee error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ GET ALL FEES
  // ===============================
  getAllFees: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllFees`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }

      console.log('📊 All Fees API Response:', data)

      if (data?.success === true) {
        return data
      } else {
        throw new Error(data?.message || 'Failed to fetch fees')
      }
    } catch (error) {
      console.error('Get all fees error:', error)
      throw error
    }
  },

  // ===============================
  // 5️⃣ DELETE FEE (FIXED)
  // ===============================
  deleteFee: async (feeId) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      if (!feeId) {
        throw new Error('Fee ID is required')
      }

      // Fix: Proper DELETE request without body or with correct payload
      // Option 1: If API expects fee_id in URL
      // const response = await fetch(
      //   `${API_BASE_URL}/schooladmin/deleteFee/${feeId}`,
      //   {
      //     method: 'DELETE',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // )

      // Option 2: If API expects fee_id in body (current implementation)
      const payload = {
        fee_id: feeId
        // Remove status: 0 if not needed
      }

      console.log('🗑️ Delete Fee Payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteFee`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (response.status === 404) {
        throw new Error('Fee structure not found')
      }

      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        // If response is empty or not JSON, check status
        if (response.ok) {
          return { success: true, message: 'Fee deleted successfully' }
        }
        throw new Error('Invalid JSON response from server')
      }

      console.log('🗑️ Delete Fee Response:', data)

      // Check for success in response
      if (response.ok && data?.success === true) {
        return data
      } else {
        const errorMessage = data?.message || data?.error || 'Failed to delete fee'
        
        // Handle specific error messages
        if (errorMessage.toLowerCase().includes('assigned to students') || 
            errorMessage.toLowerCase().includes('student assigned')) {
          throw new Error('Cannot delete fee as it is already assigned to students. Please deactivate it instead.')
        }
        if (errorMessage.toLowerCase().includes('not found')) {
          throw new Error('Fee structure not found')
        }
        if (errorMessage.toLowerCase().includes('already deleted')) {
          throw new Error('Fee structure is already deleted')
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Delete fee error:', error)
      throw error
    }
  },

  // ===============================
  // 6️⃣ DEACTIVATE FEE (Alternative to delete)
  // ===============================
  deactivateFee: async (feeId) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      if (!feeId) {
        throw new Error('Fee ID is required')
      }

      const payload = {
        fee_id: feeId,
        status: 0  // 0 for inactive
      }

      console.log('🔄 Deactivate Fee Payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateFeeStatus`, // You might need to adjust this endpoint
        {
          method: 'PUT', // or POST depending on API
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }

      console.log('🔄 Deactivate Fee Response:', data)

      if (response.ok && data?.success === true) {
        return data
      } else {
        throw new Error(data?.message || 'Failed to deactivate fee')
      }
    } catch (error) {
      console.error('Deactivate fee error:', error)
      throw error
    }
  }
}