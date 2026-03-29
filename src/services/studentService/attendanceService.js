// src/services/attendanceService.js
import { API_BASE_URL, getAuthToken } from '../api'

export const attendanceService = {
  // ✅ Get all classes
  getAllClasses: async () => {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllClassList`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch classes')
    }
    return data
  },

  // ✅ Get sections by class
  getSectionsByClass: async (classId) => {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch sections')
    }
    return data
  },

  // ✅ Get attendance marking sheet (students list)
  getAttendanceMarkingSheet: async (classId, sectionId, date) => {
    const token = getAuthToken()

    // ✅ Build params with date if provided
    const params = new URLSearchParams({
      class_id: classId,
      section_id: sectionId
    })

    if (date) {
      params.append('attendance_date', date)
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAttendanceMarkingSheet?${params}`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch students')
    }
    return data
  },

  // ✅ Mark attendance (POST) - Create new attendance
  markAttendance: async (attendanceData) => {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createAllStudentAttendance`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark attendance')
    }
    
    return data
  },

  // ✅ Update attendance (PUT) - Bulk update
  updateAttendance: async (attendanceData) => {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateAllStudentAttendance`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update attendance')
    }
    return data
  },

  // ✅ Get attendance by class and section (NEW)
  getAttendanceByClassSection: async (classId, sectionId, date) => {
    const token = getAuthToken()

    // Format date from YYYY-MM-DD to YYYY/MM/DD
    let formattedDate = date
    if (date && typeof date === 'string') {
      formattedDate = date.replace(/-/g, '/')
    }
    
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllStudentAttendanceByClassSection?class_id=${classId}&section_id=${sectionId}&date=${formattedDate}`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch attendance')
    }
    return data
  },

  // ✅ Get attendance list (with filters)
  getAttendanceList: async (params = {}) => {
    const token = getAuthToken()

    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getStudentAttendance${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch attendance list')
    }
    return data
  },

  // ✅ Delete attendance record (Method 1: with path parameter)
  deleteAttendance: async (attendanceId) => {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteAttendance/${attendanceId}`,
      {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete attendance')
    }
    return data
  },

  // ✅ Delete student attendance (Method 2: with body parameter)
  deleteStudentAttendance: async (attendanceId) => {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteStudentAttendance`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendance_id: attendanceId })
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete attendance')
    }
    return data
  },

  // ✅ Get attendance report
  getAttendanceReport: async (params = {}) => {
    const token = getAuthToken()

    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAttendanceReport${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch report')
    }
    return data
  }
}