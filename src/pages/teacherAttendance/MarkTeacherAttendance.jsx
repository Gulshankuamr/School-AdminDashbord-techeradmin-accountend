// src/pages/teacherAttendance/MarkTeacherAttendance.jsx
import React, { useState, useEffect } from 'react'
import { Calendar, Save, Loader2, Users, User, CheckCircle, XCircle, Clock, Home, ClipboardCheck, AlertCircle } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
// import { teacherAttendanceService } from '../../services/teacherAttendanceService'
import { teacherAttendanceService } from '../../services/teacherService/teacherAttendanceService'


const MarkTeacherAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [teachers, setTeachers] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [remarks, setRemarks] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const teachersPerPage = 10
  const [apiError, setApiError] = useState(null)

  // ✅ FIXED: Status options exactly as API expects
  const statusOptions = [
    { value: 'P', label: 'P', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
    { value: 'A', label: 'A', icon: <XCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-800' },
    { value: 'L', label: 'L', icon: <Clock className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'H', label: 'H', icon: <Home className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'OL', label: 'O', icon: <Users className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Fetch teachers when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTeachers()
    }
  }, [selectedDate])

  const formatDate = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      setApiError(null)
      setTeachers([]) // Clear previous data
      
      console.log('🔄 Fetching teachers for date:', formatDate(selectedDate))
      
      const response = await teacherAttendanceService.getAllTeachers()
      
      console.log('📊 API Response:', response)
      
      if (response.success) {
        const teachersList = response.data || []
        
        if (teachersList.length === 0) {
          showNotification('No teachers found in the system', 'warning')
        } else {
          showNotification(`Loaded ${teachersList.length} teachers successfully`)
        }
        
        setTeachers(teachersList)
        
        // Initialize attendance as Present for all teachers
        const initialAttendance = {}
        const initialRemarks = {}
        
        teachersList.forEach(teacher => {
          initialAttendance[teacher.teacher_id] = 'P'
          initialRemarks[teacher.teacher_id] = ''
        })
        
        setAttendanceData(initialAttendance)
        setRemarks(initialRemarks)
      } else {
        setTeachers([])
        setApiError(response.message || 'Failed to load teachers')
        showNotification(response.message || 'Failed to load teachers', 'error')
      }
    } catch (error) {
      console.error('❌ Error fetching teachers:', error)
      setTeachers([])
      setApiError(error.message)
      showNotification('Failed to load teachers: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (teacherId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [teacherId]: status
    }))
  }

  const handleRemarkChange = (teacherId, value) => {
    setRemarks(prev => ({
      ...prev,
      [teacherId]: value
    }))
  }

  const handleSaveAttendance = async () => {
    try {
      setSaving(true)
      setApiError(null)
      
      const formattedDate = formatDate(selectedDate)
      
      if (teachers.length === 0) {
        showNotification('No teachers to save attendance for', 'warning')
        return
      }

      // Create individual attendance records
      const attendanceRecords = teachers.map(teacher => ({
        teacher_id: teacher.teacher_id,
        attendance_date: formattedDate,
        status: attendanceData[teacher.teacher_id] || 'P',
        remarks: remarks[teacher.teacher_id] || ''
      }))

      console.log('💾 Saving attendance records:', attendanceRecords)

      // Save each record individually
      const savePromises = attendanceRecords.map(record => 
        teacherAttendanceService.createTeacherAttendance(record)
      )

      const responses = await Promise.all(savePromises)
      const successful = responses.filter(res => res.success).length
      const failed = responses.filter(res => !res.success).length

      if (failed > 0) {
        // Show failed records
        const failedRecords = responses
          .filter(res => !res.success)
          .map((res, index) => `Record ${index + 1}: ${res.message}`)
          .join(', ')
        
        showNotification(`${successful} records saved, ${failed} failed: ${failedRecords}`, 'warning')
      } else {
        showNotification(`${successful} attendance records saved successfully!`)
        
        // Refresh data after 1 second
        setTimeout(() => {
          fetchTeachers()
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Error saving attendance:', error)
      setApiError(error.message)
      showNotification('Failed to save attendance: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Pagination logic
  const indexOfLastTeacher = currentPage * teachersPerPage
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage
  const currentTeachers = teachers.slice(indexOfFirstTeacher, indexOfLastTeacher)
  const totalPages = Math.ceil(teachers.length / teachersPerPage)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setCurrentPage(1) // Reset to first page when date changes
  }

  const handleRetry = () => {
    fetchTeachers()
  }

  return (
    <div className="w-full p-4">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mark Teacher Attendance</h1>
            <p className="text-gray-600 mt-2">Mark attendance for all teachers by selecting date</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">API Error</h3>
              <p className="text-red-700 text-sm">{apiError}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selection Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Select Date</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Attendance Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800"
                  placeholderText="Choose date"
                />
              </div>
              
              <div className="flex items-end gap-2">
                <button
                  onClick={fetchTeachers}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Load Teachers
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {selectedDate && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100">
                <p className="text-sm text-gray-700">
                  📅 Selected Date: <span className="font-semibold">{selectedDate.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                  {teachers.length > 0 && (
                    <span className="ml-4">
                      👨‍🏫 Teachers Loaded: <span className="font-semibold">{teachers.length}</span>
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-800">{teachers.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Selected Date</p>
              <p className="text-xl font-bold text-gray-800">
                {selectedDate.toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Present Teachers</p>
              <p className="text-3xl font-bold text-gray-800">
                {Object.values(attendanceData).filter(status => status === 'P').length}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Save Status</p>
              <p className="text-xl font-bold text-gray-800">
                {saving ? 'Saving...' : teachers.length > 0 ? 'Ready' : 'Load Teachers'}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Save className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Attendance Status Options</h3>
        <div className="flex flex-wrap gap-3">
          {statusOptions.map(option => (
            <div key={option.value} className={`px-3 py-2 rounded-lg ${option.color} flex items-center gap-2`}>
              {option.icon}
              <span className="font-medium">{option.label}</span>
              <span className="text-xs bg-white px-2 py-1 rounded">({option.value})</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {/* ✅ Status codes exactly match API requirements: P (Present), A (Absent), L (Late), H (Half Day), OL (On Leave) */}
        </p>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Teacher Attendance List</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {currentTeachers.length} of {teachers.length} teachers
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAttendance}
              disabled={saving || teachers.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save All Attendance
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-700 font-medium">Loading teachers list...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait</p>
              </div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium text-lg mb-2">
                  No teachers found
                </p>
                <p className="text-gray-500 max-w-md mb-4">
                  Click "Load Teachers" to fetch teacher list from API
                </p>
                <button
                  onClick={fetchTeachers}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium transition-colors"
                >
                  Load Teachers
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Teacher Details
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Attendance Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentTeachers.map((teacher, index) => {
                  const actualIndex = indexOfFirstTeacher + index
                  
                  return (
                    <tr key={teacher.teacher_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-indigo-600 font-bold text-lg">
                              {teacher.name?.[0]?.toUpperCase() || 'T'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-800">
                              {teacher.name || 'Teacher Name'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              ID: {teacher.teacher_id || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600">
                              Email: {teacher.user_email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {teacher.qualification || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {teacher.experience_years ? `${teacher.experience_years} years` : 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map(option => (
                            <label
                              key={option.value}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-all ${
                                attendanceData[teacher.teacher_id] === option.value
                                  ? option.color + ' border-gray-300'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`attendance-${teacher.teacher_id}`}
                                value={option.value}
                                checked={attendanceData[teacher.teacher_id] === option.value}
                                onChange={() => handleAttendanceChange(teacher.teacher_id, option.value)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <div className="flex items-center gap-1">
                                {option.icon}
                                <span className="text-sm font-medium">{option.label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={remarks[teacher.teacher_id] || ''}
                          onChange={(e) => handleRemarkChange(teacher.teacher_id, e.target.value)}
                          placeholder="Enter remarks..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-800"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {teachers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstTeacher + 1} - {Math.min(indexOfLastTeacher, teachers.length)} of{' '}
                <span className="font-semibold">{teachers.length}</span> teachers
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
              
              <div className="text-sm text-gray-700">
                Date: <span className="font-semibold">{selectedDate.toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}

export default MarkTeacherAttendance