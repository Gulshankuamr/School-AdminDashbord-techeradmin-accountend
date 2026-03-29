// src/pages/teacherAttendance/TeacherAttendanceReport.jsx
import React, { useState, useEffect } from 'react'
import { Calendar, Download, Users, CheckCircle, XCircle, Clock, Home, BarChart3, Filter, TrendingUp } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { teacherAttendanceService } from '../../services/teacherService/teacherAttendanceService'

const TeacherAttendanceReport = () => {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    totalDays: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalHalfDay: 0,
    totalLeave: 0,
    attendancePercentage: 0
  })

  const generateReport = async () => {
    try {
      setLoading(true)
      
      // In a real app, you would call an API endpoint for report generation
      // For now, we'll simulate with mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock report data
      const mockData = [
        {
          teacher_id: 1,
          teacher_name: 'Dr. Rohit Sharma',
          present_days: 18,
          absent_days: 2,
          late_days: 1,
          half_day: 0,
          leave_days: 1,
          total_days: 22,
          attendance_percentage: 81.8
        },
        {
          teacher_id: 2,
          teacher_name: 'Prof. Anita Verma',
          present_days: 20,
          absent_days: 0,
          late_days: 2,
          half_day: 0,
          leave_days: 0,
          total_days: 22,
          attendance_percentage: 90.9
        },
        {
          teacher_id: 3,
          teacher_name: 'Mr. Rajesh Kumar',
          present_days: 19,
          absent_days: 1,
          late_days: 0,
          half_day: 1,
          leave_days: 1,
          total_days: 22,
          attendance_percentage: 86.4
        },
        {
          teacher_id: 4,
          teacher_name: 'Ms. Priya Singh',
          present_days: 21,
          absent_days: 0,
          late_days: 1,
          half_day: 0,
          leave_days: 0,
          total_days: 22,
          attendance_percentage: 95.5
        },
        {
          teacher_id: 5,
          teacher_name: 'Dr. Siyaram Singh',
          present_days: 17,
          absent_days: 3,
          late_days: 2,
          half_day: 0,
          leave_days: 0,
          total_days: 22,
          attendance_percentage: 77.3
        }
      ]
      
      setReportData(mockData)
      
      // Calculate summary
      const totalPresent = mockData.reduce((sum, item) => sum + item.present_days, 0)
      const totalAbsent = mockData.reduce((sum, item) => sum + item.absent_days, 0)
      const totalLate = mockData.reduce((sum, item) => sum + item.late_days, 0)
      const totalHalfDay = mockData.reduce((sum, item) => sum + item.half_day, 0)
      const totalLeave = mockData.reduce((sum, item) => sum + item.leave_days, 0)
      const totalDays = mockData.reduce((sum, item) => sum + item.total_days, 0)
      const attendancePercentage = totalDays > 0 ? ((totalPresent + totalHalfDay * 0.5) / totalDays) * 100 : 0
      
      setSummary({
        totalDays: mockData.length,
        totalPresent,
        totalAbsent,
        totalLate,
        totalHalfDay,
        totalLeave,
        attendancePercentage: attendancePercentage.toFixed(2)
      })
      
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const exportData = {
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      summary,
      data: reportData
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `teacher_attendance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPercentageBar = (percentage) => {
    let color = 'bg-red-500'
    if (percentage >= 90) color = 'bg-green-500'
    else if (percentage >= 75) color = 'bg-yellow-500'
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    )
  }

  useEffect(() => {
    generateReport()
  }, [])

  return (
    <div className="w-full p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Attendance Report</h1>
            <p className="text-gray-600 mt-2">Analyze attendance trends and generate reports</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
                />
              </div>
              
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
            
            <button
              onClick={handleExport}
              disabled={reportData.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700">
            📅 Date Range: <span className="font-semibold">
              {startDate.toLocaleDateString('en-GB')} to {endDate.toLocaleDateString('en-GB')}
            </span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-800">{summary.totalDays}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-green-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Present Days</p>
              <p className="text-3xl font-bold text-green-600">{summary.totalPresent}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Absent Days</p>
              <p className="text-3xl font-bold text-red-600">{summary.totalAbsent}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Attendance %</p>
              <p className="text-3xl font-bold text-amber-600">{summary.attendancePercentage}%</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Detailed Attendance Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing attendance summary for all teachers
          </p>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Teacher Name
                </th>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Present
                </th>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Absent
                </th>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Late
                </th>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Half Day
                </th>
                <th className="px6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Leave
                </th>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Total Days
                </th>
                <th className="px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-700 font-medium">Generating report...</p>
                      <p className="text-sm text-gray-500 mt-1">Please wait</p>
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium text-lg mb-2">
                        No report data available
                      </p>
                      <p className="text-gray-500 max-w-md">
                        Select date range and click "Generate Report"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.map((item) => (
                  <tr key={item.teacher_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">
                        {item.teacher_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        ID: {item.teacher_id}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                        {item.present_days}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-sm">
                        {item.absent_days}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                        {item.late_days}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                        {item.half_day}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm">
                        {item.leave_days}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-gray-800">
                        {item.total_days}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={`font-bold ${getPercentageColor(item.attendance_percentage)}`}>
                            {item.attendance_percentage}%
                          </span>
                        </div>
                        {getPercentageBar(item.attendance_percentage)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {reportData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700">
              Report generated for <span className="font-semibold">{reportData.length} teachers</span> • 
              Date Range: <span className="font-semibold">{startDate.toLocaleDateString('en-GB')} to {endDate.toLocaleDateString('en-GB')}</span> • 
              Overall Attendance: <span className={`font-bold ${getPercentageColor(summary.attendancePercentage)}`}>
                {summary.attendancePercentage}%
              </span>
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

export default TeacherAttendanceReport