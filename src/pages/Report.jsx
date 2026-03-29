// Report.jsx
import React, { useState } from 'react';
import { 
  Users, 
  UserCog, 
  Users2, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Download,
  Filter,
  Eye,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

const Report = () => {
  // State for filters
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('all');
  
  // School summary data
  const schoolSummary = [
    {
      id: 1,
      title: "Total Students",
      value: "1,856",
      icon: <Users className="w-6 h-6 text-purple-600" />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      textColor: "text-purple-700",
      trend: "+8.2%",
      trendUp: true,
      detail: "Active enrollment"
    },
    {
      id: 2,
      title: "Teaching Staff",
      value: "48",
      icon: <UserCog className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-700",
      trend: "+3.4%",
      trendUp: true,
      detail: "Including part-time"
    },
    {
      id: 3,
      title: "Parents",
      value: "3,425",
      icon: <Users2 className="w-6 h-6 text-orange-600" />,
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
      textColor: "text-orange-700",
      trend: "+6.8%",
      trendUp: true,
      detail: "Registered parents"
    },
    {
      id: 4,
      title: "Revenue",
      value: "₹8.92L",
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-700",
      trend: "+12.5%",
      trendUp: true,
      detail: "This academic year"
    }
  ];

  // Attendance statistics
  const attendanceStats = [
    { day: 'Mon', present: 92, absent: 5, late: 3 },
    { day: 'Tue', present: 94, absent: 4, late: 2 },
    { day: 'Wed', present: 91, absent: 6, late: 3 },
    { day: 'Thu', present: 93, absent: 5, late: 2 },
    { day: 'Fri', present: 95, absent: 3, late: 2 },
    { day: 'Sat', present: 90, absent: 7, late: 3 },
    { day: 'Sun', present: 0, absent: 100, late: 0 }
  ];

  // Top performing classes
  const topClasses = [
    { id: 1, className: "Class 12-A", teacher: "Mr. Sharma", avgScore: 92.5, students: 42, trend: "up" },
    { id: 2, className: "Class 10-B", teacher: "Ms. Patel", avgScore: 89.3, students: 38, trend: "up" },
    { id: 3, className: "Class 11-A", teacher: "Mr. Kumar", avgScore: 87.8, students: 40, trend: "stable" },
    { id: 4, className: "Class 9-C", teacher: "Ms. Gupta", avgScore: 85.2, students: 35, trend: "up" },
    { id: 5, className: "Class 12-B", teacher: "Mr. Singh", avgScore: 83.6, students: 39, trend: "down" }
  ];

  // Fee collection status
  const feeCollection = {
    total: 1856,
    paid: 1625,
    pending: 231,
    overdue: 85,
    percentage: 87.5
  };

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      title: "New Student Enrollment",
      subtitle: "15 new students joined",
      date: "Today, 10:30 AM",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      iconBg: "bg-blue-100",
      type: "enrollment"
    },
    {
      id: 2,
      title: "Exam Results Published",
      subtitle: "Final term results updated",
      date: "Yesterday, 3:45 PM",
      icon: <Award className="w-5 h-5 text-purple-600" />,
      iconBg: "bg-purple-100",
      type: "academic"
    },
    {
      id: 3,
      title: "Fee Payment Deadline",
      subtitle: "Quarterly fees due tomorrow",
      date: "2 days ago",
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      iconBg: "bg-emerald-100",
      type: "finance"
    },
    {
      id: 4,
      title: "Parent-Teacher Meeting",
      subtitle: "Scheduled for Friday",
      date: "3 days ago",
      icon: <Users2 className="w-5 h-5 text-orange-600" />,
      iconBg: "bg-orange-100",
      type: "event"
    },
    {
      id: 5,
      title: "New Subject Added",
      subtitle: "Computer Science for Class 11",
      date: "1 week ago",
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
      iconBg: "bg-indigo-100",
      type: "academic"
    }
  ];

  // School performance by subject
  const subjectPerformance = [
    { subject: "Mathematics", avgScore: 88.5, topScore: 98, improvement: "+5.2%" },
    { subject: "Science", avgScore: 85.2, topScore: 96, improvement: "+3.8%" },
    { subject: "English", avgScore: 82.7, topScore: 94, improvement: "+4.1%" },
    { subject: "Social Studies", avgScore: 80.3, topScore: 92, improvement: "+2.9%" },
    { subject: "Computer Science", avgScore: 90.1, topScore: 99, improvement: "+6.7%" }
  ];

  // Student performance chart data
  const studentPerformanceData = [
    { label: "Class 9", y: 75 },
    { label: "Class 10", y: 82 },
    { label: "Class 11", y: 78 },
    { label: "Class 12", y: 88 },
    { label: "Class 8", y: 72 },
    { label: "Class 7", y: 69 },
    { label: "Class 6", y: 65 }
  ];

  // Calculate attendance percentage
  const calculateAttendancePercentage = () => {
    const totalDays = attendanceStats.length - 1; // Exclude Sunday
    const totalPresent = attendanceStats.slice(0, 6).reduce((sum, day) => sum + day.present, 0);
    return ((totalPresent / (totalDays * 100)) * 100).toFixed(1);
  };

  // Render custom bar chart for student performance
  const renderStudentPerformanceChart = () => {
    const maxScore = Math.max(...studentPerformanceData.map(item => item.y));
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Academic Performance</h3>
            <p className="text-gray-600 text-sm mt-1">Average scores across different classes</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              This Year
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              Export
            </button>
          </div>
        </div>
        
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-gray-500 text-sm">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-12 h-full">
            {/* Grid lines */}
            <div className="h-full flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-gray-200"></div>
              ))}
            </div>
            
            {/* Bars */}
            <div className="absolute inset-0 ml-12 flex items-end justify-between px-4">
              {studentPerformanceData.map((item, index) => {
                const barHeight = (item.y / maxScore) * 100;
                const isTop = item.y === maxScore;
                
                return (
                  <div key={index} className="flex flex-col items-center w-12">
                    <div className="relative w-10 group">
                      {/* Bar */}
                      <div 
                        className={`w-10 rounded-t-lg transition-all duration-300 group-hover:opacity-90 ${
                          isTop 
                            ? 'bg-gradient-to-b from-blue-600 to-blue-500' 
                            : 'bg-gradient-to-b from-blue-500 to-blue-400'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      ></div>
                      
                      {/* Value label */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {item.y}%
                        </div>
                      </div>
                      
                      {/* Top indicator */}
                      {isTop && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
                            Top
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 mt-2 font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-b from-blue-600 to-blue-500 rounded mr-2"></div>
              <span className="text-gray-600">Based on final exam results</span>
            </div>
            <span className="text-gray-500">Data updated: Today</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">School Admin Analytics Report</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of school performance and statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-black">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
                <option value="yearly">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="all">All Classes</option>
                <option value="12">Class 12</option>
                <option value="11">Class 11</option>
                <option value="10">Class 10</option>
                <option value="9">Class 9</option>
                <option value="8">Class 8</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 1️⃣ School Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {schoolSummary.map((card) => (
          <div 
            key={card.id} 
            className={`${card.bgColor} rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>{card.value}</p>
                <div className="flex items-center mt-3">
                  {card.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${card.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.trend}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">{card.detail}</span>
                </div>
              </div>
              <div className={`${card.iconBg} p-3 rounded-xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Performance Chart */}
      <div className="mb-8">
        {renderStudentPerformanceChart()}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Weekly Attendance Trend</h2>
                <p className="text-gray-600 text-sm mt-1">Overall attendance: {calculateAttendancePercentage()}%</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Late</span>
                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="relative h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-gray-500 text-sm">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-12 h-full">
                {/* Grid lines */}
                <div className="h-full flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-200"></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="absolute inset-0 ml-12 flex items-end justify-between px-4">
                  {attendanceStats.map((day, index) => (
                    <div key={index} className="flex flex-col items-center w-12">
                      <div className="flex flex-col-reverse w-full h-48">
                        {/* Present bar */}
                        <div 
                          className="bg-emerald-500 rounded-t"
                          style={{ height: `${day.present}%` }}
                        ></div>
                        {/* Absent bar */}
                        <div 
                          className="bg-red-500"
                          style={{ height: `${day.absent}%` }}
                        ></div>
                        {/* Late bar */}
                        <div 
                          className="bg-amber-500 rounded-b"
                          style={{ height: `${day.late}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 mt-2">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Classes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Top Performing Classes</h2>
                <p className="text-gray-600 text-sm mt-1">Based on average academic scores</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View Details <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              {topClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mr-4">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{classItem.className}</h3>
                      <p className="text-sm text-gray-600">Teacher: {classItem.teacher}</p>
                      <p className="text-xs text-gray-500">{classItem.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end mb-1">
                      <span className="text-2xl font-bold text-gray-800">{classItem.avgScore}%</span>
                      {classItem.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-emerald-600 ml-2" />
                      )}
                      {classItem.trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-red-600 ml-2" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600">Average Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Fee Collection Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Fee Collection Status</h2>
              <p className="text-gray-600 text-sm mt-1">Current academic year</p>
            </div>

            {/* Progress Circle */}
            <div className="relative flex justify-center items-center mb-6">
              <div className="relative w-40 h-40">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                
                {/* Progress circle */}
                <div className="absolute inset-0 rounded-full border-8 border-emerald-500"
                     style={{
                       clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)`,
                       transform: `rotate(${feeCollection.percentage * 3.6}deg)`
                     }}>
                </div>
                
                {/* Center circle */}
                <div className="absolute inset-0 m-8 rounded-full bg-gray-50 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{feeCollection.percentage}%</span>
                  <span className="text-sm text-gray-600">Collected</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                  <span className="text-gray-700">Fees Paid</span>
                </div>
                <div className="font-medium text-gray-800">{feeCollection.paid} students</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-amber-600 mr-2" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="font-medium text-gray-800">{feeCollection.pending} students</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-gray-700">Overdue</span>
                </div>
                <div className="font-medium text-gray-800">{feeCollection.overdue} students</div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
              <p className="text-gray-600 text-sm mt-1">Latest school updates</p>
            </div>

            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`${activity.iconBg} p-2 rounded-lg mr-3`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Subject-wise Performance</h2>
          <p className="text-gray-600 text-sm mt-1">Average scores across subjects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {subjectPerformance.map((subject, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{subject.subject}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  parseFloat(subject.improvement) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subject.improvement}
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Average</span>
                  <span className="font-medium">{subject.avgScore}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${subject.avgScore}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Top Score: <span className="font-medium text-gray-700">{subject.topScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">98.2%</div>
            <div className="text-sm text-gray-600">Teacher Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">94.7%</div>
            <div className="text-sm text-gray-600">Student Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">89.3%</div>
            <div className="text-sm text-gray-600">Exam Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">96.4%</div>
            <div className="text-sm text-gray-600">Parent Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Report generated: {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default Report;