// src/pages/accountantAttendance/AccountantAttendanceList.jsx
import React, { useState } from 'react'
import { Calendar, Users, CheckCircle, XCircle, Clock, Home, Edit, Save, Trash2, X, User, Briefcase, RefreshCw } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { accountantAttendanceService } from '../../services/accountendService/accountantAttendanceService'

const AccountantAttendanceList = () => {
  const [attendanceList, setAttendanceList] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState(new Date())
  
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // ✅ Status options exactly as API expects
  const statusOptions = [
    { value: 'P', label: 'Present', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'A', label: 'Absent', icon: <XCircle className="w-4 h-4" />, color: 'bg-rose-100 text-rose-800 border-rose-300' },
    { value: 'L', label: 'Late', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'H', label: 'Half Day', icon: <Home className="w-4 h-4" />, color: 'bg-sky-100 text-sky-800 border-sky-300' },
    { value: 'OL', label: 'On Leave', icon: <Briefcase className="w-4 h-4" />, color: 'bg-violet-100 text-violet-800 border-violet-300' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' })
    }, 3000)
  }

  // ✅ Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // ✅ Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // ✅ Format time for display
  const formatTimeForDisplay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // ✅ Fetch attendance when Reload button is clicked
  const fetchAttendanceList = async () => {
    try {
      setLoading(true)
      setEditingId(null)
      
      const formattedDate = formatDateForAPI(dateFilter)
      
      console.log('📅 Fetching attendance for date:', formattedDate)
      
      const response = await accountantAttendanceService.getAccountantAttendanceByDate(formattedDate)
      
      console.log('📊 Attendance API Response:', response)
      
      if (response.success) {
        const attendanceRecords = response.data || []
        
        // ✅ Format the data - ONLY for selected date
        const formattedList = attendanceRecords.map(record => ({
          id: record.attendance_id,
          attendance_id: record.attendance_id,
          accountant_id: record.accountant_id,
          accountant_name: record.accountant_name || 'Unknown Accountant',
          attendance_date: record.attendance_date,
          status: record.status || 'P',
          remarks: record.remarks || '',
          marked_at: record.created_at || null,
          marked_by: record.marked_by
        }))
        
        console.log('📋 Formatted attendance list:', formattedList)
        setAttendanceList(formattedList)
        setIsDataLoaded(true)
        
        if (formattedList.length === 0) {
          showNotification(`No attendance records found for ${formatDateForDisplay(dateFilter)}`, 'info')
        }
      } else {
        setAttendanceList([])
        setIsDataLoaded(true)
        showNotification(response.message || `No attendance data found for ${formatDateForDisplay(dateFilter)}`, 'info')
      }
    } catch (error) {
      console.error('❌ Error fetching attendance list:', error)
      showNotification('Failed to load attendance data: ' + error.message, 'error')
      setAttendanceList([])
      setIsDataLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status) || statusOptions[0]
    
    return (
      <div className={`px-3 py-1.5 rounded-lg border ${statusOption.color} flex items-center gap-2 w-fit`}>
        {statusOption.icon}
        <span className="font-semibold text-sm">{statusOption.label}</span>
      </div>
    )
  }

  const handleEdit = (record) => {
    console.log('✏️ Editing record:', record)
    
    // ✅ Validate attendance_id
    if (!record.attendance_id) {
      showNotification('Error: attendance_id missing from record', 'error')
      console.error('❌ Record missing attendance_id:', record)
      return
    }

    setEditingId(record.id)
    setEditForm({
      attendance_id: record.attendance_id,
      status: record.status || 'P',
      remarks: record.remarks || ''
    })
    
    console.log('📝 Edit form initialized:', {
      attendance_id: record.attendance_id,
      status: record.status,
      remarks: record.remarks
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async (record) => {
    try {
      console.log('💾 Saving update for record:', record)
      console.log('📝 Current editForm:', editForm)
      
      // ✅ Validate attendance_id exists
      if (!editForm.attendance_id) {
        showNotification('Error: attendance_id is required', 'error')
        console.error('❌ Missing attendance_id in editForm')
        return
      }

      // ✅ Send only required fields with correct types
      const updateData = {
        attendance_id: Number(editForm.attendance_id),
        status: editForm.status,
        remarks: editForm.remarks || ''
      }

      console.log('📤 Sending update payload:', updateData)

      const response = await accountantAttendanceService.updateAccountantAttendance(updateData)
      
      console.log('✅ Update response:', response)
      
      if (response.success) {
        showNotification('✓ Attendance updated successfully')
        
        // Refresh the list after a short delay
        setTimeout(async () => {
          await fetchAttendanceList()
          setEditingId(null)
          setEditForm({})
        }, 500)
      } else {
        showNotification(response.message || 'Failed to update attendance', 'error')
      }
    } catch (error) {
      console.error('❌ Error updating attendance:', error)
      showNotification('Update failed: ' + error.message, 'error')
    }
  }

  const handleDelete = async (record) => {
    if (!record.attendance_id) {
      showNotification('Error: attendance_id not available', 'error')
      return
    }

    if (!window.confirm(`Delete attendance for ${record.accountant_name}?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(record.id)
      
      console.log('🗑️ Deleting attendance ID:', record.attendance_id)
      
      const response = await accountantAttendanceService.deleteAccountantAttendance(record.attendance_id)
      
      console.log('✅ Delete response:', response)
      
      if (response.success) {
        showNotification('✓ Attendance deleted successfully')
        
        // Refresh the list
        setTimeout(async () => {
          await fetchAttendanceList()
        }, 500)
      } else {
        showNotification(response.message || 'Failed to delete attendance', 'error')
      }
    } catch (error) {
      console.error('❌ Error deleting attendance:', error)
      showNotification('Delete failed: ' + error.message, 'error')
    } finally {
      setDeleteLoading(null)
    }
  }

  // ✅ Calculate statistics ONLY for selected date
  const presentCount = attendanceList.filter(r => r.status === 'P').length
  const absentCount = attendanceList.filter(r => r.status === 'A').length
  const lateCount = attendanceList.filter(r => r.status === 'L').length
  const halfDayCount = attendanceList.filter(r => r.status === 'H').length
  const leaveCount = attendanceList.filter(r => r.status === 'OL').length

  return (
    <div className="max-w-7xl mx-auto p-4">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'error' ? 'bg-rose-100 text-rose-800 border border-rose-200' : notification.type === 'info' ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500' : notification.type === 'info' ? 'bg-sky-500' : 'bg-emerald-500'}`}></div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Accountant Attendance List</h1>
            <p className="text-gray-600 mt-2">View and manage accountant attendance records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection Card - SIMPLIFIED */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Select Date
            </label>
            <DatePicker
              selected={dateFilter}
              onChange={(date) => {
                setDateFilter(date)
                setIsDataLoaded(false)
                setAttendanceList([])
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose date"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAttendanceList}
              disabled={loading}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Load Attendance
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Attendance Status Legend</h3>
        <div className="flex flex-wrap gap-3">
          {statusOptions.map(option => (
            <div key={option.value} className={`px-3 py-2 rounded-lg border-2 ${option.color} flex items-center gap-2 shadow-sm`}>
              {option.icon}
              <span className="font-medium">{option.label}</span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono">
                {option.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards - ONLY show when data is loaded */}
      {isDataLoaded && attendanceList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-800">{attendanceList.length}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">For selected date</p>
          </div>
          
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Present</p>
                <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Status: P</p>
          </div>
          
          <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Absent</p>
                <p className="text-2xl font-bold text-rose-600">{absentCount}</p>
              </div>
              <div className="bg-rose-50 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Status: A</p>
          </div>
          
          <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Late</p>
                <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Status: L</p>
          </div>
          
          <div className="bg-white rounded-xl border border-sky-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Half Day</p>
                <p className="text-2xl font-bold text-sky-600">{halfDayCount}</p>
              </div>
              <div className="bg-sky-50 p-2 rounded-lg">
                <Home className="w-5 h-5 text-sky-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Status: H</p>
          </div>
          
          <div className="bg-white rounded-xl border border-violet-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">On Leave</p>
                <p className="text-2xl font-bold text-violet-600">{leaveCount}</p>
              </div>
              <div className="bg-violet-50 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Status: OL</p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Attendance Records</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isDataLoaded 
                  ? `Showing ${attendanceList.length} records for ${formatDateForDisplay(dateFilter)}`
                  : 'Select a date and click "Load Attendance" to view records'
                }
              </p>
            </div>
            {isDataLoaded && attendanceList.length > 0 && (
              <div className="mt-2 md:mt-0">
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-sm font-medium">
                  Date: {formatDateForDisplay(dateFilter)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Accountant Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Attendance Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Remarks
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Marked Time
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!isDataLoaded ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium text-lg mb-2">
                        Select a Date to View Attendance
                      </p>
                      <p className="text-gray-500 max-w-md">
                        Choose a date from the calendar and click "Load Attendance" button
                      </p>
                      <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 mt-4">
                        Current Selection: {formatDateForDisplay(dateFilter)}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
                      <p className="text-gray-700 font-medium">Loading attendance records for {formatDateForDisplay(dateFilter)}...</p>
                      <p className="text-sm text-gray-500 mt-1">Please wait</p>
                    </div>
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium text-lg mb-2">
                        No Attendance Records Found
                      </p>
                      <p className="text-gray-500 max-w-md">
                        No attendance records found for {formatDateForDisplay(dateFilter)}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendanceList.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-indigo-600 font-bold text-lg">
                            {record.accountant_name?.[0]?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-800">
                            {record.accountant_name}
                          </div>
                          {/* ID नहीं दिखाएंगे */}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">
                        {formatDateForDisplay(record.attendance_date)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 bg-white font-semibold"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value} className="text-gray-800">
                              {option.label} ({option.value})
                            </option>
                          ))}
                        </select>
                      ) : (
                        getStatusBadge(record.status)
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === record.id ? (
                        <input
                          type="text"
                          value={editForm.remarks}
                          onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                          placeholder="Enter remarks..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 bg-white"
                        />
                      ) : (
                        <div className={`text-sm font-medium ${record.remarks ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                          {record.remarks || 'No remarks'}
                        </div>
                      )}
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      {record.marked_at ? (
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-gray-800">
                            {formatDateForDisplay(record.marked_at)}
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-1 inline-block">
                            {formatTimeForDisplay(record.marked_at)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not marked</span>
                      )}
                    </td> */}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {editingId === record.id ? (
                          <>
                            <button
                              onClick={() => handleSave(record)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(record)}
                              className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              disabled={deleteLoading === record.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
                            >
                              {deleteLoading === record.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isDataLoaded && attendanceList.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">{attendanceList.length} records</span> displayed • 
                Date: <span className="font-semibold text-indigo-600">{formatDateForDisplay(dateFilter)}</span>
              </div>
              <div className="text-sm text-gray-700">
                Present: <span className="font-semibold text-emerald-600">{presentCount}</span> • 
                Absent: <span className="font-semibold text-rose-600">{absentCount}</span> • 
                Late: <span className="font-semibold text-amber-600">{lateCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {isDataLoaded 
            ? `Showing attendance for: ${formatDateForDisplay(dateFilter)}`
            : 'Select a date and click "Load Attendance"'
          }
        </p>
      </div>
    </div>
  )
}

export default AccountantAttendanceList