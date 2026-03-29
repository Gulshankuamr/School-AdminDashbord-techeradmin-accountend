import { API_BASE_URL, getAuthToken } from '../api'

export const feeHeadService = {

  // ===============================
  // 1️⃣ GET ALL FEE HEADS
  // ===============================
  getAllFeeHeads: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllFeeHeads`,
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
      console.log('📊 getAllFeeHeads raw response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch fee heads')
      }

      console.log('📊 Fee Heads data structure:', {
        hasData: !!data.data,
        count: data.data?.count,
        feeHeadsLength: data.data?.fee_heads?.length,
        firstItem: data.data?.fee_heads?.[0]
      })

      return data
    } catch (error) {
      console.error('Get all fee heads error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ CREATE FEE HEAD
  // ===============================
  createFeeHead: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createFeeHead`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            head_name: payload.name,
            description: payload.description,
            status: payload.status === 'Active' ? 1 : 0   // ✅ FIX: Send status
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || 'Failed to create fee head')
      }

      return data
    } catch (error) {
      console.error('Create fee head error:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ GET FEE HEAD BY ID (Optional)
  // ===============================
  getFeeHeadById: async (feeHeadId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getFeeHeadById?fee_head_id=${feeHeadId}`,
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

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch fee head')
      }

      return data
    } catch (error) {
      console.error('Get fee head by ID error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ UPDATE FEE HEAD
  // ===============================
  updateFeeHead: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateFeeHead`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fee_head_id: payload.id,
            head_name: payload.name,
            description: payload.description,
            // status: payload.status === 'Active' ? 1 : 0   // ✅ FIX: Send status
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || 'Failed to update fee head')
      }

      return data
    } catch (error) {
      console.error('Update fee head error:', error)
      throw error
    }
  },

  // ===============================
  // 5️⃣ DELETE FEE HEAD
  // ===============================
  deleteFeeHead: async (feeHeadId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteFeeHead`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fee_head_id: feeHeadId,
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

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to delete fee head')
      }

      return data
    } catch (error) {
      console.error('Delete fee head error:', error)
      throw error
    }
  },

   
}
