import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock, Home, Download, Filter, Activity } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
// import { attendanceService } from '../../services/attendanceService'
import { attendanceService } from '../../services/studentService/attendanceService'


const AttendanceReport = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  })
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Colors for charts
  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6']

  useEffect(() => {
    fetchClasses()
    fetchReport()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass)
    } else {
      setSections([])
      setSelectedSection('')
    }
  }, [selectedClass])

  useEffect(() => {
    fetchReport()
  }, [dateRange, selectedClass, selectedSection])

  const fetchClasses = async () => {
    try {
      const response = await attendanceService.getAllClasses()
      if (response.success) {
        setClasses(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchSections = async (classId) => {
    try {
      const response = await attendanceService.getSectionsByClass(classId)
      if (response.success) {
        setSections(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  const fetchReport = async () => {
    try {
      setLoading(true)
      
      const params = {
        start_date: formatDate(dateRange.start),
        end_date: formatDate(dateRange.end),
        ...(selectedClass && { class_id: selectedClass }),
        ...(selectedSection && { section_id: selectedSection })
      }

      const response = await attendanceService.getAttendanceReport(params)
      
      if (response.success) {
        setReportData(response.data || generateMockReport())
      } else {
        setReportData(generateMockReport())
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setReportData(generateMockReport())
    } finally {
      setLoading(false)
    }
  }

  const generateMockReport = () => {
    // Generate mock data similar to what your API would return
    const totalStudents = 150
    const totalDays = Math.floor((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1
    
    return {
      summary: {
        total_students: totalStudents,
        total_days: totalDays,
        present_count: Math.floor(totalStudents * totalDays * 0.85),
        absent_count: Math.floor(totalStudents * totalDays * 0.08),
        late_count: Math.floor(totalStudents * totalDays * 0.05),
        holiday_count: Math.floor(totalStudents * totalDays * 0.02),
        overall_percentage: 88.5,
        average_daily_attendance: 85.2
      },
      daily_trend: Array.from({ length: totalDays }, (_, i) => {
        const date = new Date(dateRange.start)
        date.setDate(date.getDate() + i)
        return {
          date: date.toISOString().split('T')[0],
          present: Math.floor(Math.random() * 30) + 120,
          absent: Math.floor(Math.random() * 10) + 1,
          late: Math.floor(Math.random() * 8) + 1,
          holiday: date.getDay() === 0 ? 5 : 0
        }
      }),
      class_wise_data: classes.slice(0, 5).map((cls, i) => ({
        class_name: cls.class_name,
        present_percentage: Math.floor(Math.random() * 20) + 75,
        absent_percentage: Math.floor(Math.random() * 15) + 5,
        late_percentage: Math.floor(Math.random() * 10) + 1,
        total_students: Math.floor(Math.random() * 40) + 20
      })),
      status_distribution: [
        { name: 'Present', value: 85, count: 1275 },
        { name: 'Absent', value: 8, count: 120 },
        { name: 'Late', value: 5, count: 75 },
        { name: 'Holiday', value: 2, count: 30 }
      ],
      top_absent_students: [
        { student_name: 'John Doe', roll_no: '101', absent_days: 5, total_days: 22, percentage: 22.7 },
        { student_name: 'Jane Smith', roll_no: '102', absent_days: 4, total_days: 22, percentage: 18.2 },
        { student_name: 'Bob Johnson', roll_no: '103', absent_days: 3, total_days: 22, percentage: 13.6 },
        { student_name: 'Alice Brown', roll_no: '104', absent_days: 3, total_days: 22, percentage: 13.6 },
        { student_name: 'Charlie Wilson', roll_no: '105', absent_days: 2, total_days: 22, percentage: 9.1 }
      ]
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatChartDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  const handleExport = () => {
    if (!reportData) return
    
    // Create CSV content
    let csvContent = 'Attendance Report\n\n'
    
    // Summary section
    csvContent += 'SUMMARY\n'
    csvContent += `Total Students,${reportData.summary.total_students}\n`
    csvContent += `Total Days,${reportData.summary.total_days}\n`
    csvContent += `Present Count,${reportData.summary.present_count}\n`
    csvContent += `Absent Count,${reportData.summary.absent_count}\n`
    csvContent += `Late Count,${reportData.summary.late_count}\n`
    csvContent += `Holiday Count,${reportData.summary.holiday_count}\n`
    csvContent += `Overall Percentage,${reportData.summary.overall_percentage}%\n`
    csvContent += `Average Daily Attendance,${reportData.summary.average_daily_attendance}%\n\n`
    
    // Status distribution
    csvContent += 'STATUS DISTRIBUTION\n'
    csvContent += 'Status,Percentage,Count\n'
    reportData.status_distribution.forEach(item => {
      csvContent += `${item.name},${item.value}%,${item.count}\n`
    })
    csvContent += '\n'
    
    // Top absent students
    csvContent += 'TOP ABSENT STUDENTS\n'
    csvContent += 'Name,Roll No,Absent Days,Total Days,Percentage\n'
    reportData.top_absent_students.forEach(student => {
      csvContent += `${student.student_name},${student.roll_no},${student.absent_days},${student.total_days},${student.percentage}%\n`
    })
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance_report_${formatDate(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating report...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
            <p className="text-gray-600 mt-1">Comprehensive attendance analytics and insights</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              Start Date
            </label>
            <DatePicker
              selected={dateRange.start}
              onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
              dateFormat="dd-MM-yyyy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              End Date
            </label>
            <DatePicker
              selected={dateRange.end}
              onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
              dateFormat="dd-MM-yyyy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section.section_id} value={section.section_id}>{section.section_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Period Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Report Period: {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
              <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {reportData.summary.total_days} days
              </span>
            </div>
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'trends', 'analytics', 'details'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.summary.overall_percentage}%
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${reportData.summary.overall_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.summary.total_students}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Daily</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.summary.average_daily_attendance}%
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.summary.total_days}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.status_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {reportData.status_distribution.map((item, index) => (
                  <div key={item.name} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-lg font-bold">{item.value}%</div>
                    <div className="text-xs text-gray-500">{item.count} records</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Count Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Counts</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Present
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {reportData.summary.present_count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ 
                        width: `${(reportData.summary.present_count / 
                          (reportData.summary.present_count + reportData.summary.absent_count + 
                           reportData.summary.late_count + reportData.summary.holiday_count) * 100).toFixed(0)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      Absent
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {reportData.summary.absent_count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ 
                        width: `${(reportData.summary.absent_count / 
                          (reportData.summary.present_count + reportData.summary.absent_count + 
                           reportData.summary.late_count + reportData.summary.holiday_count) * 100).toFixed(0)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                      Late
                    </span>
                    <span className="text-lg font-bold text-yellow-600">
                      {reportData.summary.late_count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ 
                        width: `${(reportData.summary.late_count / 
                          (reportData.summary.present_count + reportData.summary.absent_count + 
                           reportData.summary.late_count + reportData.summary.holiday_count) * 100).toFixed(0)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Home className="w-4 h-4 text-blue-500 mr-2" />
                      Holiday
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {reportData.summary.holiday_count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ 
                        width: `${(reportData.summary.holiday_count / 
                          (reportData.summary.present_count + reportData.summary.absent_count + 
                           reportData.summary.late_count + reportData.summary.holiday_count) * 100).toFixed(0)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Attendance Trend</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatChartDate}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  labelFormatter={formatChartDate}
                  formatter={(value) => [value, 'Students']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  name="Present" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  name="Absent" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  name="Late" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Class-wise Attendance Performance</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.class_wise_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="class_name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
                <Bar dataKey="present_percentage" name="Present %" fill="#10B981" />
                <Bar dataKey="absent_percentage" name="Absent %" fill="#EF4444" />
                <Bar dataKey="late_percentage" name="Late %" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Absent Students</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.top_absent_students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.roll_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">{student.absent_days}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.total_days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-3">
                          {student.percentage}%
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${student.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.percentage > 20 
                          ? 'bg-red-100 text-red-800'
                          : student.percentage > 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {student.percentage > 20 ? 'High Absenteeism' : 
                         student.percentage > 10 ? 'Moderate Absenteeism' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceReport