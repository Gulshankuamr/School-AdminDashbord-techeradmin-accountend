// src/services/teacherAttendanceService.js
import { API_BASE_URL, getAuthToken } from '../api'

export const teacherAttendanceService = {
  // ✅ Get all teachers list
  getAllTeachers: async () => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('🔍 Fetching teachers from:', `${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId`)
                       
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId`,
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
        
        throw new Error(`Failed to fetch teachers: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API Success Response:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error in getAllTeachers:', error)
      throw error
    }
  },

  // ✅ Create teacher attendance
  createTeacherAttendance: async (attendanceData) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('📝 Creating attendance for:', attendanceData)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createTeacherAttendance`,
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
        throw new Error(data.message || 'Failed to mark teacher attendance')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in createTeacherAttendance:', error)
      throw error
    }
  },

  // ✅ FIXED: Get teacher attendance by date
  getTeacherAttendanceByDate: async (date) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('📅 Fetching attendance for date:', date)

      // ✅ FIXED: Format date as YYYY/MM/DD for API
      const formattedDate = date.replace(/-/g, '/');
      
      console.log('🔗 API URL:', `${API_BASE_URL}/schooladmin/getTeacherAttendance?attendance_date=${formattedDate}`)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getTeacherAttendance?attendance_date=${formattedDate}`,
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
        throw new Error(data.message || `Failed to fetch teacher attendance: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in getTeacherAttendanceByDate:', error)
      throw error
    }
  },

  // ✅ FIXED: Update teacher attendance
  updateTeacherAttendance: async (attendanceData) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('✏️ Updating attendance:', attendanceData)

      const payload = {
        attendance_id: attendanceData.attendance_id,
        status: attendanceData.status,
        remarks: attendanceData.remarks
      }

      console.log('📤 Update payload:', payload)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateTeacherAttendance`,
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

      const data = await response.json()
      console.log('✅ Update Attendance Response:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update teacher attendance')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in updateTeacherAttendance:', error)
      throw error
    }
  },

  // ✅ Delete teacher attendance
  deleteTeacherAttendance: async (attendanceId) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('🗑️ Deleting attendance ID:', attendanceId)

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteTeacherAttendance`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ attendance_id: attendanceId })
        }
      )

      console.log('📡 Delete Attendance Response Status:', response.status)

      const data = await response.json()
      console.log('✅ Delete Attendance Response:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete teacher attendance')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error in deleteTeacherAttendance:', error)
      throw error
    }
  },
}