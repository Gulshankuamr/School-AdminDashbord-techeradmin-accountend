// src/components/attendance/AttendanceTable.jsx
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Home, Save, Loader2 } from 'lucide-react'
// import { attendanceService } from '../../services/attendanceService'
import { attendanceService } from '../../services/studentService/attendanceService'


const AttendanceTable = ({ date, classId, sectionId, onUpdate }) => {
  const [students, setStudents] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [remarks, setRemarks] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classInfo, setClassInfo] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 10

  // ✅ Fetch students when filters change
  useEffect(() => {
    if (classId && sectionId && date) {
      fetchStudents()
    }
  }, [classId, sectionId, date])

  // ✅ FIXED: Using service instead of direct fetch
  const fetchStudents = async () => {
    try {
      setLoading(true)

      // ✅ Use service method with date parameter
      const response = await attendanceService.getAttendanceMarkingSheet(
        classId,
        sectionId,
        date
      )

      if (response.success && response.data) {
        const { class_info, students: studentList } = response.data

        setClassInfo(class_info)
        setStudents(studentList || [])

        // ✅ Reset pagination when new data loads
        setCurrentPage(1)

        // ✅ Initialize attendance as Present
        const initialAttendance = {}
        const initialRemarks = {}

        studentList?.forEach((student) => {
          initialAttendance[student.student_id] = 'P'
          initialRemarks[student.student_id] = ''
        })

        setAttendanceData(initialAttendance)
        setRemarks(initialRemarks)
      } else {
        alert('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      alert(error.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleRemarkChange = (studentId, value) => {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: value
    }))
  }

  // ✅ FIXED: Using service instead of direct fetch
  const handleSaveAttendance = async () => {
    if (!classId || !sectionId || !date) {
      alert('Please select date, class, and section first')
      return
    }

    try {
      setSaving(true)

      const attendanceRecords = students.map((student) => ({
        student_id: student.student_id,
        status: attendanceData[student.student_id] || 'P',
        remarks: remarks[student.student_id] || ''
      }))

      const requestData = {
        class_id: Number(classId),
        section_id: Number(sectionId),
        attendance_date: date,
        students: attendanceRecords
      }

      // ✅ Use service method
      const data = await attendanceService.markAttendance(requestData)

      if (data.success) {
        const { successful, failed, errors } = data.data

        if (failed > 0) {
          const errorMessages = errors
            ?.map((err) => `Student ID ${err.student_id}: ${err.reason}`)
            .join('\n')

          alert(
            `✅ ${successful} records saved successfully.\n❌ ${failed} records failed:\n${errorMessages}`
          )
        } else {
          alert(`✅ ${successful} attendance records saved successfully!`)
          
          // Refresh the list
          if (onUpdate) onUpdate()
        }
      } else {
        alert(`❌ Failed to save attendance: ${data.message}`)
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert(error.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(students.length / studentsPerPage)

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

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600">Loading students...</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <p className="text-gray-500">No students found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      {classInfo && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Class: {classInfo.class_name} | Section: {classInfo.section_name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Date: {date}</p>
            </div>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 transition-all flex items-center gap-2 shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">
                S.N.
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">
                Roll No
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">
                Student Name
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-black uppercase">
                Attendance (P/A/L/H)
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.map((student, index) => {
              const actualIndex = indexOfFirstStudent + index

              return (
                <tr key={student.student_id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-black">
                    {actualIndex + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {student.roll_no || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name || 'Student Name'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      {['P', 'A', 'L', 'H'].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-1.5 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name={`attendance-${student.student_id}`}
                            value={status}
                            checked={attendanceData[student.student_id] === status}
                            onChange={() =>
                              handleAttendanceChange(student.student_id, status)
                            }
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span
                            className={`text-sm font-bold transition-colors ${
                              attendanceData[student.student_id] === status
                                ? 'text-blue-600'
                                : 'text-gray-600 group-hover:text-blue-500'
                            }`}
                          >
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={remarks[student.student_id] || ''}
                      onChange={(e) =>
                        handleRemarkChange(student.student_id, e.target.value)
                      }
                      placeholder="Enter remarks..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstStudent + 1} - {Math.min(indexOfLastStudent, students.length)} of{' '}
            <span className="font-semibold">{students.length}</span> students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-black">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTable