// src/pages/accountantAttendance/AccountantAttendanceReport.jsx
import React, { useState, useEffect } from 'react'
import { Search, Calendar, Download, Users, CheckCircle, XCircle, Clock, Home, Filter, BarChart3, PieChart, TrendingUp, TrendingDown, FileText, Mail, User, Briefcase } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
// import { accountantAttendanceService } from '../../services/accountantAttendanceService'
import { accountantAttendanceService } from '../../services/accountendService/accountantAttendanceService'


const AccountantAttendanceReport = () => {
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  })
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })
  const [statistics, setStatistics] = useState({
    totalDays: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalHalfDay: 0,
    totalLeave: 0,
    averageAttendance: 0,
    highestAttendanceDate: '',
    lowestAttendanceDate: ''
  })
  const [chartType, setChartType] = useState('bar')
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })

  // Status options
  const statusOptions = [
    { value: 'P', label: 'Present', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'A', label: 'Absent', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'L', label: 'Late', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'H', label: 'Half Day', icon: <Home className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'OL', label: 'On Leave', icon: <Briefcase className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800 border-purple-200' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Format date for API
  const formatDate = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Generate report
  const generateReport = async () => {
    try {
      setLoading(true)
      
      const startDate = formatDate(dateRange.startDate)
      const endDate = formatDate(dateRange.endDate)
      
      console.log('📊 Generating report from:', startDate, 'to', endDate)
      
      // Note: Since we don't have a specific report API, we'll simulate it
      // In real implementation, you would call an API like:
      // const response = await accountantAttendanceService.getAttendanceReport(startDate, endDate)
      
      // For now, we'll simulate with dummy data
      const simulatedReport = await simulateReportData(startDate, endDate)
      setReportData(simulatedReport)
      calculateStatistics(simulatedReport)
      
      showNotification('Report generated successfully')
      
    } catch (error) {
      console.error('❌ Error generating report:', error)
      showNotification('Failed to generate report: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Simulate report data (replace with actual API call)
  const simulateReportData = async (startDate, endDate) => {
    // This is a simulation. In real app, you would call the API
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const accountants = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Robert Johnson', email: 'robert@example.com' },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com' },
      { id: 5, name: 'Michael Brown', email: 'michael@example.com' },
    ]
    
    const report = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= Math.min(diffDays, 30); i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i)
      
      const formattedDate = formatDate(currentDate)
      const dayOfWeek = days[currentDate.getDay() % 6]
      
      // Generate attendance for each accountant on this date
      accountants.forEach(accountant => {
        const statusOptions = ['P', 'P', 'P', 'P', 'A', 'L', 'H', 'OL']
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)]
        
        report.push({
          id: `${formattedDate}-${accountant.id}`,
          date: formattedDate,
          day: dayOfWeek,
          accountant_id: accountant.id,
          accountant_name: accountant.name,
          accountant_email: accountant.email,
          status: randomStatus,
          remarks: randomStatus === 'P' ? 'Present' : 
                   randomStatus === 'A' ? 'Absent' : 
                   randomStatus === 'L' ? 'Late' : 
                   randomStatus === 'H' ? 'Half Day' : 'On Leave',
          marked_at: `${formattedDate}T${Math.floor(Math.random() * 10) + 8}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00.000Z`
        })
      })
    }
    
    return report
  }

  // Calculate statistics from report data
  const calculateStatistics = (data) => {
    if (!data || data.length === 0) {
      setStatistics({
        totalDays: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalHalfDay: 0,
        totalLeave: 0,
        averageAttendance: 0,
        highestAttendanceDate: '',
        lowestAttendanceDate: ''
      })
      return
    }

    // Count by status
    const presentCount = data.filter(item => item.status === 'P').length
    const absentCount = data.filter(item => item.status === 'A').length
    const lateCount = data.filter(item => item.status === 'L').length
    const halfDayCount = data.filter(item => item.status === 'H').length
    const leaveCount = data.filter(item => item.status === 'OL').length
    
    // Calculate unique dates
    const uniqueDates = [...new Set(data.map(item => item.date))]
    
    // Calculate attendance by date
    const attendanceByDate = {}
    uniqueDates.forEach(date => {
      const dateData = data.filter(item => item.date === date)
      const presentOnDate = dateData.filter(item => item.status === 'P').length
      attendanceByDate[date] = presentOnDate
    })
    
    // Find highest and lowest attendance dates
    let highestDate = ''
    let highestCount = -1
    let lowestDate = ''
    let lowestCount = Infinity
    
    Object.entries(attendanceByDate).forEach(([date, count]) => {
      if (count > highestCount) {
        highestCount = count
        highestDate = date
      }
      if (count < lowestCount) {
        lowestCount = count
        lowestDate = date
      }
    })
    
    // Calculate average attendance percentage
    const totalRecords = data.length
    const totalAccountants = [...new Set(data.map(item => item.accountant_id))].length
    const totalPossiblePresent = uniqueDates.length * totalAccountants
    const averageAttendance = totalPossiblePresent > 0 ? 
      (presentCount / totalPossiblePresent * 100).toFixed(1) : 0
    
    setStatistics({
      totalDays: uniqueDates.length,
      totalPresent: presentCount,
      totalAbsent: absentCount,
      totalLate: lateCount,
      totalHalfDay: halfDayCount,
      totalLeave: leaveCount,
      averageAttendance,
      highestAttendanceDate: highestDate,
      lowestAttendanceDate: lowestDate
    })
  }

  // Filter report data
  const filteredReportData = reportData.filter(item => {
    if (filters.status && item.status !== filters.status) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        item.accountant_name.toLowerCase().includes(searchLower) ||
        item.accountant_email.toLowerCase().includes(searchLower) ||
        item.remarks.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  // Handle export
  const handleExport = () => {
    const exportData = {
      filters: {
        dateRange: {
          start: formatDate(dateRange.startDate),
          end: formatDate(dateRange.endDate)
        },
        statusFilter: filters.status,
        searchTerm: filters.search,
        total_records: filteredReportData.length
      },
      statistics: statistics,
      data: filteredReportData
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `accountant_attendance_report_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Report exported successfully')
  }

  // Handle CSV export
  const handleCSVExport = () => {
    if (filteredReportData.length === 0) {
      showNotification('No data to export', 'error')
      return
    }
    
    const headers = ['Date', 'Day', 'Accountant ID', 'Accountant Name', 'Accountant Email', 'Status', 'Remarks', 'Marked Time']
    const csvRows = [
      headers.join(','),
      ...filteredReportData.map(item => [
        item.date,
        item.day,
        item.accountant_id,
        `"${item.accountant_name}"`,
        item.accountant_email,
        item.status,
        `"${item.remarks}"`,
        item.marked_at
      ].join(','))
    ]
    
    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `accountant_attendance_report_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('CSV exported successfully')
  }

  // Format display date
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status) || statusOptions[0]
    return (
      <div className={`px-2 py-1 rounded-md text-xs font-medium ${statusOption.color}`}>
        {statusOption.label}
      </div>
    )
  }

  // Initial report generation
  useEffect(() => {
    generateReport()
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-4">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : notification.type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'info' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Accountant Attendance Report</h1>
            <p className="text-gray-600 mt-2">Generate and analyze accountant attendance reports</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range and Filters Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose start date"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800"
            />
          </div>
          
          <div>
            <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date
            </label>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose end date"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800"
            />
          </div>
          
          <div>
            <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800"
            >
              <option value="">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by accountant name, email, or remarks..."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
            <button
              onClick={() => {
                setFilters({ status: '', search: '' })
                setDateRange({
                  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
                  endDate: new Date()
                })
              }}
              className="w-full px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 font-semibold transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Overall Statistics</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-2 rounded-lg ${chartType === 'pie' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.totalPresent}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(statistics.totalPresent / Math.max(statistics.totalPresent + statistics.totalAbsent, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.totalAbsent}</p>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(statistics.totalAbsent / Math.max(statistics.totalPresent + statistics.totalAbsent, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Average %</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.averageAttendance}%</p>
                </div>
                <div className="flex items-center">
                  {parseFloat(statistics.averageAttendance) >= 90 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${statistics.averageAttendance}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Total Days</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.totalDays}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formatDisplayDate(dateRange.startDate)} to {formatDisplayDate(dateRange.endDate)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Present</span>
              </div>
              <span className="font-semibold text-gray-800">{statistics.totalPresent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Absent</span>
              </div>
              <span className="font-semibold text-gray-800">{statistics.totalAbsent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Late</span>
              </div>
              <span className="font-semibold text-gray-800">{statistics.totalLate}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700">Half Day</span>
              </div>
              <span className="font-semibold text-gray-800">{statistics.totalHalfDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-700">On Leave</span>
              </div>
              <span className="font-semibold text-gray-800">{statistics.totalLeave}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Performance Highlights</h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Highest Attendance</span>
              </div>
              <p className="text-xs text-gray-600">Date: {statistics.highestAttendanceDate ? formatDisplayDate(statistics.highestAttendanceDate) : 'N/A'}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Lowest Attendance</span>
              </div>
              <p className="text-xs text-gray-600">Date: {statistics.lowestAttendanceDate ? formatDisplayDate(statistics.lowestAttendanceDate) : 'N/A'}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Report Period</span>
              </div>
              <p className="text-xs text-gray-600">
                {formatDisplayDate(dateRange.startDate)} - {formatDisplayDate(dateRange.endDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">Export Options</h3>
            <p className="text-sm text-gray-600">Export report data in different formats</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCSVExport}
              disabled={filteredReportData.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Export as CSV
            </button>
            <button
              onClick={handleExport}
              disabled={filteredReportData.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export as JSON
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Detailed Report</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredReportData.length} of {reportData.length} records
              </p>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{filteredReportData.length} records</span> • 
              Filtered by: <span className="font-semibold">{filters.status || 'All Status'}</span>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date & Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Accountant Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Marked Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
                      <p className="text-gray-700 font-medium">Generating report...</p>
                      <p className="text-sm text-gray-500 mt-1">Please wait</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReportData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium text-lg mb-2">
                        {reportData.length === 0 
                          ? 'No report data available' 
                          : 'No matching records found'}
                      </p>
                      <p className="text-gray-500 max-w-md">
                        {reportData.length === 0 
                          ? 'Click "Generate Report" to create a report' 
                          : 'Try different filters or search criteria'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReportData.slice(0, 100).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">
                        {formatDisplayDate(record.date)}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-1 inline-block">
                        {record.day}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-purple-600 font-bold">
                            {record.accountant_name?.[0]?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-800">
                            {record.accountant_name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {record.accountant_email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800 max-w-xs truncate">
                        {record.remarks}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">
                        {new Date(record.marked_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredReportData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {Math.min(filteredReportData.length, 100)} of {filteredReportData.length} records • 
                Period: <span className="font-semibold">{formatDisplayDate(dateRange.startDate)} to {formatDisplayDate(dateRange.endDate)}</span>
              </div>
              <div className="text-sm text-gray-700">
                Generated: <span className="font-semibold">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Report generated on: {new Date().toLocaleDateString('en-GB', { 
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

export default AccountantAttendanceReport