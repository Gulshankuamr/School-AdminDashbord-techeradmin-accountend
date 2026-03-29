// src/services/accountantAttendanceService.js
import { API_BASE_URL, getAuthToken } from '../api'

export const accountantAttendanceService = {
  // ✅ Get all accountants list
  getAllAccountants: async () => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('🔍 Fetching accountants from:', `${API_BASE_URL}/schooladmin/getTotalAccountantsListBySchoolId`)
      
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getTotalAccountantsListBySchoolId`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('📡 API Response Status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        
        throw new Error(`Failed to fetch accountants: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API Success Response:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error in getAllAccountants:', error)
      throw error
    }
  },

  // ✅ Create accountant attendance
  createAccountantAttendance: async (attendanceData) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('📝 Creating attendance for:', attendanceData)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createAccountantAttendance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(attendanceData)
        }
      )

      console.log('📡 Create Attendance Response Status:', response.status)

      const data = await response.json()
      console.log('✅ Create Attendance Response:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to mark accountant attendance')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in createAccountantAttendance:', error)
      throw error
    }
  },

  // ✅ FIXED: Get accountant attendance by date
  getAccountantAttendanceByDate: async (date) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('📅 Fetching attendance for date:', date)

      // ✅ FIXED: API uses "attendance_date" parameter, not "date"
      const formattedDate = date.replace(/-/g, '/'); // Convert YYYY-MM-DD to YYYY/MM/DD if needed
      
      console.log('🔗 API URL:', `${API_BASE_URL}/schooladmin/getAccountantAttendance?attendance_date=${formattedDate}`)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAccountantAttendance?attendance_date=${formattedDate}`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('📡 Get Attendance Response Status:', response.status)

      const data = await response.json()
      console.log('✅ Get Attendance Response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch accountant attendance: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in getAccountantAttendanceByDate:', error)
      throw error
    }
  },

  // ✅ Update accountant attendance
  updateAccountantAttendance: async (attendanceData) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      // ✅ Validate required fields
      if (!attendanceData.attendance_id) {
        throw new Error('attendance_id is required for update')
      }

      if (!attendanceData.status) {
        throw new Error('status is required for update')
      }

      console.log('✏️ Updating attendance with data:', attendanceData)

      // ✅ Send exactly what API expects - only these 3 fields
      const payload = {
        attendance_id: Number(attendanceData.attendance_id), // Ensure it's a number
        status: attendanceData.status,
        remarks: attendanceData.remarks || '' // Default to empty string if not provided
      }

      console.log('📤 Final update payload being sent to API:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateAccountantAttendance`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      console.log('📡 Update Attendance Response Status:', response.status)

      // Get response text first for debugging
      const responseText = await response.text()
      console.log('📄 Raw response:', responseText)

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`)
      }

      console.log('✅ Update Attendance Response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to update attendance`)
      }

      if (!data.success) {
        throw new Error(data.message || 'Update failed - API returned success: false')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in updateAccountantAttendance:', error)
      console.error('❌ Error stack:', error.stack)
      throw error
    }
  },

  // ✅ Delete accountant attendance
  deleteAccountantAttendance: async (attendanceId) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      if (!attendanceId) {
        throw new Error('attendance_id is required for delete')
      }

      console.log('🗑️ Deleting attendance ID:', attendanceId)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteAccountantAttendance`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ attendance_id: Number(attendanceId) })
        }
      )

      console.log('📡 Delete Attendance Response Status:', response.status)

      const data = await response.json()
      console.log('✅ Delete Attendance Response:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete accountant attendance')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in deleteAccountantAttendance:', error)
      throw error
    }
  }
}