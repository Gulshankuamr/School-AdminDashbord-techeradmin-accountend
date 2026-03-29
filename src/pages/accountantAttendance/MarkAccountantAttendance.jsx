// src/pages/accountantAttendance/MarkAccountantAttendance.jsx
import React, { useState, useEffect } from 'react'
import { Calendar, Save, Loader2, Users, User, CheckCircle, XCircle, Clock, Home, ClipboardCheck, AlertCircle, RefreshCw } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
// import { accountantAttendanceService } from '../../services/accountantAttendanceService'
import { accountantAttendanceService } from '../../services/accountendService/accountantAttendanceService'


const MarkAccountantAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [accountants, setAccountants] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [remarks, setRemarks] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const accountantsPerPage = 10
  const [apiError, setApiError] = useState(null)

  // ✅ Status options exactly as API expects
  const statusOptions = [
    { value: 'P', label: 'P', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' },
    { value: 'A', label: 'A', icon: <XCircle className="w-3 h-3" />, color: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200' },
    { value: 'L', label: 'L', icon: <Clock className="w-3 h-3" />, color: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' },
    { value: 'H', label: 'H', icon: <Home className="w-3 h-3" />, color: 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200' },
    { value: 'OL', label: 'O', icon: <Users className="w-3 h-3" />, color: 'bg-violet-100 text-violet-800 border-violet-300 hover:bg-violet-200' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' })
    }, 3500)
  }

  useEffect(() => {
    if (selectedDate) {
      fetchAccountants()
    }
  }, [selectedDate])

  const formatDate = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchAccountants = async () => {
    try {
      setLoading(true)
      setApiError(null)
      setAccountants([])
      
      console.log('🔄 Fetching accountants for date:', formatDate(selectedDate))
      
      const response = await accountantAttendanceService.getAllAccountants()
      
      console.log('📊 API Response:', response)
      
      if (response.success) {
        const accountantsList = response.data || []
        
        if (accountantsList.length === 0) {
          showNotification('No accountants found in the system', 'warning')
        } else {
          showNotification(`✓ Loaded ${accountantsList.length} accountants successfully`)
        }
        
        setAccountants(accountantsList)
        
        // Initialize attendance as Present for all accountants
        const initialAttendance = {}
        const initialRemarks = {}
        
        accountantsList.forEach(accountant => {
          initialAttendance[accountant.accountant_id] = 'P'
          initialRemarks[accountant.accountant_id] = ''
        })
        
        setAttendanceData(initialAttendance)
        setRemarks(initialRemarks)
      } else {
        setAccountants([])
        setApiError(response.message || 'Failed to load accountants')
        showNotification(response.message || 'Failed to load accountants', 'error')
      }
    } catch (error) {
      console.error('❌ Error fetching accountants:', error)
      setAccountants([])
      setApiError(error.message)
      showNotification('Failed to load accountants: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (accountantId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [accountantId]: status
    }))
  }

  const handleRemarkChange = (accountantId, value) => {
    setRemarks(prev => ({
      ...prev,
      [accountantId]: value
    }))
  }

  const handleSaveAttendance = async () => {
    try {
      setSaving(true)
      setApiError(null)
      
      const formattedDate = formatDate(selectedDate)
      
      if (accountants.length === 0) {
        showNotification('No accountants to save attendance for', 'warning')
        return
      }

      const attendanceRecords = accountants.map(accountant => ({
        accountant_id: accountant.accountant_id,
        attendance_date: formattedDate,
        status: attendanceData[accountant.accountant_id] || 'P',
        remarks: remarks[accountant.accountant_id] || ''
      }))

      console.log('💾 Saving attendance records:', attendanceRecords)

      const savePromises = attendanceRecords.map(record => 
        accountantAttendanceService.createAccountantAttendance(record)
      )

      const responses = await Promise.all(savePromises)
      const successful = responses.filter(res => res.success).length
      const failed = responses.filter(res => !res.success).length

      if (failed > 0) {
        const failedRecords = responses
          .filter(res => !res.success)
          .map((res, index) => `Record ${index + 1}: ${res.message}`)
          .join(', ')
        
        showNotification(`${successful} saved, ${failed} failed: ${failedRecords}`, 'warning')
      } else {
        showNotification(`✓ ${successful} attendance records saved successfully!`)
        
        setTimeout(() => {
          fetchAccountants()
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
  const indexOfLastAccountant = currentPage * accountantsPerPage
  const indexOfFirstAccountant = indexOfLastAccountant - accountantsPerPage
  const currentAccountants = accountants.slice(indexOfFirstAccountant, indexOfLastAccountant)
  const totalPages = Math.ceil(accountants.length / accountantsPerPage)

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
    setCurrentPage(1)
  }

  const handleRetry = () => {
    fetchAccountants()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Notification Toast */}
        {notification.show && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm flex items-center gap-3 animate-slide-in-right border-2 ${
            notification.type === 'error' 
              ? 'bg-rose-50/95 text-rose-900 border-rose-300' 
              : notification.type === 'warning' 
              ? 'bg-amber-50/95 text-amber-900 border-amber-300' 
              : 'bg-emerald-50/95 text-emerald-900 border-emerald-300'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              notification.type === 'error' ? 'bg-rose-500' : notification.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></div>
            <span className="font-semibold">{notification.message}</span>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Mark Accountant Attendance
              </h1>
              <p className="text-gray-600 text-lg">Mark attendance for all accountants by selecting date</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <ClipboardCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-5 bg-rose-50/80 backdrop-blur-sm border-2 border-rose-300 rounded-2xl shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-rose-900 mb-2 text-lg">API Error</h3>
                <p className="text-rose-800 text-sm font-medium">{apiError}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 text-sm font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-indigo-100 p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Select Date</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className=" text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Attendance Date
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 transition-all"
                    placeholderText="Choose date"
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    onClick={fetchAccountants}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Load Accountants
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {selectedDate && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <p className="text-sm text-gray-800 font-semibold">
                    📅 Selected Date: <span className="font-black">{selectedDate.toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                    {accountants.length > 0 && (
                      <span className="ml-4">
                        👨‍💼 Accountants Loaded: <span className="font-black">{accountants.length}</span>
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Accountants</p>
                <p className="text-4xl font-black text-gray-800">{accountants.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Selected Date</p>
                <p className="text-xl font-black text-gray-800">
                  {selectedDate.toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-2xl">
                <Calendar className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-green-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Present Accountants</p>
                <p className="text-4xl font-black text-gray-800">
                  {Object.values(attendanceData).filter(status => status === 'P').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Save Status</p>
                <p className="text-xl font-black text-gray-800">
                  {saving ? 'Saving...' : accountants.length > 0 ? 'Ready' : 'Load Accountants'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-2xl">
                <Save className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="mb-6 p-5 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Attendance Status Options</h3>
          <div className="flex flex-wrap gap-3">
            {statusOptions.map(option => (
              <div key={option.value} className={`px-4 py-2.5 rounded-lg border-2 ${option.color} flex items-center gap-2 shadow-sm`}>
                {option.icon}
                <span className="font-bold">{option.label}</span>
                <span className="text-xs bg-white/70 px-2 py-1 rounded-md border border-gray-300 font-mono">
                  {option.value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 font-medium">
            ✅ Status codes exactly match API requirements: P (Present), A (Absent), L (Late), H (Half Day), OL (On Leave)
          </p>
        </div>

        {/* Attendance Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-800 mb-1">Accountant Attendance List</h2>
              <p className="text-sm text-gray-600 font-semibold">
                Showing {currentAccountants.length} of {accountants.length} accountants
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAttendance}
                disabled={saving || accountants.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="px-6 py-20 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                  <p className="text-gray-700 font-bold text-lg">Loading accountants list...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
                </div>
              </div>
            ) : accountants.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-3xl mb-4 shadow-inner">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-bold text-xl mb-2">
                    No accountants found
                  </p>
                  <p className="text-gray-500 max-w-md mb-4">
                    Click "Load Accountants" to fetch accountant list from API
                  </p>
                  <button
                    onClick={fetchAccountants}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Load Accountants
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Accountant Details
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Attendance Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentAccountants.map((accountant, index) => {
                    const actualIndex = indexOfFirstAccountant + index
                    
                    return (
                      <tr key={accountant.accountant_id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-black text-xl">
                                {accountant.name?.[0]?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {accountant.name || 'Accountant Name'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                ID: {accountant.accountant_id || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Email: {accountant.user_email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-800">
                            {accountant.qualification || 'N/A'}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            accountant.status === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {accountant.status === 1 ? 'Active' : 'Inactive'}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {statusOptions.map(option => (
                              <label
                                key={option.value}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border-2 transition-all ${
                                  attendanceData[accountant.accountant_id] === option.value
                                    ? option.color + ' shadow-md'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`attendance-${accountant.accountant_id}`}
                                  value={option.value}
                                  checked={attendanceData[accountant.accountant_id] === option.value}
                                  onChange={() => handleAttendanceChange(accountant.accountant_id, option.value)}
                                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="flex items-center gap-1">
                                  {option.icon}
                                  <span className="text-sm font-bold">{option.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={remarks[accountant.accountant_id] || ''}
                            onChange={(e) => handleRemarkChange(accountant.accountant_id, e.target.value)}
                            placeholder="Enter remarks..."
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-800 transition-all"
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
          {accountants.length > 0 && (
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm text-gray-700 font-semibold">
                  Showing {indexOfFirstAccountant + 1} - {Math.min(indexOfLastAccountant, accountants.length)} of{' '}
                  <span className="font-black">{accountants.length}</span> accountants
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="px-5 py-2.5 text-sm font-black text-gray-800">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
                
                <div className="text-sm text-gray-700 font-semibold">
                  Date: <span className="font-black">{selectedDate.toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
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

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default MarkAccountantAttendance