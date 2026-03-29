import { API_BASE_URL, getAuthToken } from '../api'

export const feeFineRuleService = {
  // ===============================
  // 1️⃣ GET ALL FINE RULES - FIXED
  // ===============================
  getAllFineRules: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllFineRules`,
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
      console.log('📊 getAllFineRules raw response:', data)

      // Handle API response structure
      if (data && data.success === true && data.data) {
        let fineRulesArray = []
        
        if (Array.isArray(data.data.fine_rules)) {
          fineRulesArray = data.data.fine_rules
        } else if (Array.isArray(data.data)) {
          fineRulesArray = data.data
        } else if (Array.isArray(data)) {
          fineRulesArray = data
        }

        // ✅ FIX: Don't override empty strings - use API data as is
        return {
          success: true,
          data: {
            fine_rules: fineRulesArray,
            count: fineRulesArray.length
          }
        }
      } else if (Array.isArray(data)) {
        // Direct array response
        return {
          success: true,
          data: {
            fine_rules: data,
            count: data.length
          }
        }
      } else {
        throw new Error(data?.message || 'Invalid response structure')
      }
    } catch (error) {
      console.error('Get all fine rules error:', error)
      throw error
    }
  },

  // ===============================
  // 2️⃣ GET FINE RULE BY ID
  // ===============================
  getFineRuleById: async (fine_rule_id) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getFineRuleById?fine_rule_id=${fine_rule_id}`,
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
      console.log('📊 getFineRuleById raw response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch fine rule')
      }

      return data
    } catch (error) {
      console.error('Get fine rule by id error:', error)
      throw error
    }
  },

  // ===============================
  // 3️⃣ CREATE FINE RULE - FIXED: NO DEFAULT OVERRIDE
  // ===============================
  createFineRule: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      // ✅ FIX: Send payload as is, no default override
      console.log('📤 Sending createFineRule payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createFineRule`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      console.log('📥 Create response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Create error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.message || `HTTP error! status: ${response.status}`)
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('📊 createFineRule raw response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to create fine rule')
      }

      return data
    } catch (error) {
      console.error('Create fine rule error:', error)
      throw error
    }
  },

  // ===============================
  // 4️⃣ UPDATE FINE RULE - FIXED: NO DEFAULT OVERRIDE
  // ===============================
  updateFineRule: async (payload) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      // ✅ FIX: Send payload as is, no default override
      console.log('📤 Sending updateFineRule payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateFineRule`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      console.log('📥 Update response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Update error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.message || `HTTP error! status: ${response.status}`)
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('📊 updateFineRule raw response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to update fine rule')
      }

      return data
    } catch (error) {
      console.error('Update fine rule error:', error)
      throw error
    }
  },

  // ===============================
  // 5️⃣ DELETE FINE RULE
  // ===============================
  deleteFineRule: async (fine_rule_id) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    try {
      console.log('🗑️ Deleting fine rule ID:', fine_rule_id)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteFineRule`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fine_rule_id: fine_rule_id,
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Delete error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.message || `HTTP error! status: ${response.status}`)
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid JSON response from server')
      }

      console.log('📊 deleteFineRule raw response:', data)

      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to delete fine rule')
      }

      return data
    } catch (error) {
      console.error('Delete fine rule error:', error)
      throw error
    }
  },


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

      if (data && data.success === true && data.data) {
        let feeHeadsArray = []
        
        if (Array.isArray(data.data.fee_heads)) {
          feeHeadsArray = data.data.fee_heads
        } else if (Array.isArray(data.data)) {
          feeHeadsArray = data.data
        } else if (Array.isArray(data)) {
          feeHeadsArray = data
        }

        return {
          success: true,
          data: {
            fee_heads: feeHeadsArray,
            count: feeHeadsArray.length
          }
        }
      } else if (Array.isArray(data)) {
        return {
          success: true,
          data: {
            fee_heads: data,
            count: data.length
          }
        }
      } else {
        throw new Error(data?.message || 'Invalid response structure')
      }
    } catch (error) {
      console.error('Get all fee heads error:', error)
      throw error
    }
  },
}