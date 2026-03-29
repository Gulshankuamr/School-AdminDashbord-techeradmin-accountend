// src/components/attendance/AttendanceFilters.jsx
import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
// import { attendanceService } from '../../services/attendanceService'
import { attendanceService } from '../../services/studentService/attendanceService'


const AttendanceFilters = ({ onShowList, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    date: initialFilters.date || new Date().toISOString().split('T')[0],
    class: initialFilters.class || '',
    section: initialFilters.section || ''
  })
  
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)

  // ✅ Fetch classes on mount
  useEffect(() => {
    fetchClasses()
  }, [])

  // ✅ Fetch sections when class changes
  useEffect(() => {
    if (filters.class) {
      fetchSections(filters.class)
    } else {
      setSections([])
      setFilters(prev => ({ ...prev, section: '' }))
    }
  }, [filters.class])

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true)
      const response = await attendanceService.getAllClasses()
      if (response.success) {
        setClasses(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      alert('Failed to load classes')
    } finally {
      setLoadingClasses(false)
    }
  }

  const fetchSections = async (classId) => {
    try {
      setLoadingSections(true)
      const response = await attendanceService.getSectionsByClass(classId)
      if (response.success) {
        setSections(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      alert('Failed to load sections')
    } finally {
      setLoadingSections(false)
    }
  }

  const handleDateChange = (date) => {
    const formattedDate = date ? date.toISOString().split('T')[0] : ''
    setFilters(prev => ({ ...prev, date: formattedDate }))
  }

  const handleClassChange = (e) => {
    const classId = e.target.value
    setFilters(prev => ({ ...prev, class: classId, section: '' }))
  }

  const handleSectionChange = (e) => {
    const sectionId = e.target.value
    setFilters(prev => ({ ...prev, section: sectionId }))
  }

  const handleShowList = () => {
    if (!filters.date || !filters.class || !filters.section) {
      alert('Please select date, class, and section')
      return
    }
    onShowList(filters)
  }

  const getSelectedClassName = () => {
    const selectedClass = classes.find(c => c.class_id == filters.class)
    return selectedClass ? selectedClass.class_name : ''
  }

  const getSelectedSectionName = () => {
    const selectedSection = sections.find(s => s.section_id == filters.section)
    return selectedSection ? selectedSection.section_name : ''
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-black">MARK ATTENDANCE</h2>
        <p className="text-black text-sm mt-1">
          Select date, class and section to mark attendance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Attendance Date
          </label>
          <DatePicker
            selected={filters.date ? new Date(filters.date) : new Date()}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
            placeholderText="Select date"
          />
          {filters.date && (
            <p className="text-xs text-black mt-1">
              Selected: {new Date(filters.date).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>

        {/* Class Dropdown */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Class
          </label>
          <select
            value={filters.class}
            onChange={handleClassChange}
            disabled={loadingClasses}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-black"
          >
            <option value="" className="text-black">Select Class</option>
            {loadingClasses ? (
              <option value="" disabled className="text-black">Loading classes...</option>
            ) : (
              classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id} className="text-black">
                  {cls.class_name}
                </option>
              ))
            )}
          </select>
          {filters.class && (
            <p className="text-xs text-black mt-1">
              Selected: {getSelectedClassName()}
            </p>
          )}
        </div>

        {/* Section Dropdown */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Section
          </label>
          <select
            value={filters.section}
            onChange={handleSectionChange}
            disabled={!filters.class || loadingSections}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-black"
          >
            <option value="" className="text-black">Select Section</option>
            {loadingSections ? (
              <option value="" disabled className="text-black">Loading sections...</option>
            ) : (
              sections.map(section => (
                <option key={section.section_id} value={section.section_id} className="text-black">
                  {section.section_name}
                </option>
              ))
            )}
          </select>
          {filters.section && (
            <p className="text-xs text-black mt-1">
              Selected: {getSelectedSectionName()}
            </p>
          )}
        </div>
      </div>

      {/* Show List Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleShowList}
          disabled={!filters.date || !filters.class || !filters.section}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          Show List
        </button>
        
        {/* Selected Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            {filters.date && filters.class && filters.section ? (
              <>
                📅 Date: {new Date(filters.date).toLocaleDateString('en-GB')} | 
                🏫 Class: {getSelectedClassName()} | 
                📚 Section: {getSelectedSectionName()}
              </>
            ) : (
              'Please select date, class, and section'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AttendanceFilters