import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
// import { sectionService } from '../../services/sectionService'
import { sectionService } from '../../services/sectionService/sectionService'


const EditSection = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  const [formData, setFormData] = useState({
    section_id: '',
    class_id: '',
    section_name: '',
    status: 1
  })

  const [classes, setClasses] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingSection, setLoadingSection] = useState(true)

  // Fetch classes for dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true)
        const res = await sectionService.getAllClasses()
        setClasses(res.data || [])
      } catch (err) {
        console.error('Error fetching classes:', err)
        setErrorMessage('Failed to load classes')
        setShowError(true)
        setTimeout(() => setShowError(false), 5000)
      } finally {
        setLoadingClasses(false)
      }
    }

    fetchClasses()
  }, [])

  // Fetch section data for editing
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoadingSection(true)

        // First check if section data was passed via navigation state
        if (location.state?.section) {
          const section = location.state.section
          setFormData({
            section_id: section.section_id,
            class_id: section.class_id.toString(), // Convert to string for select
            section_name: section.section_name,
            status: section.status
          })
          setLoadingSection(false)
          return
        }

        // If no state data, fetch from API
        // Since there's no getSectionById API, we'll fetch all and filter
        const res = await sectionService.getAllSections()
        const section = res.data.find(s => s.section_id === parseInt(id))
        
        if (section) {
          setFormData({
            section_id: section.section_id,
            class_id: section.class_id.toString(), // Convert to string for select
            section_name: section.section_name,
            status: section.status
          })
        } else {
          throw new Error('Section not found')
        }
      } catch (err) {
        console.error('Error fetching section:', err)
        setErrorMessage('Failed to load section data')
        setShowError(true)
        setTimeout(() => {
          navigate('/admin/sections')
        }, 2000)
      } finally {
        setLoadingSection(false)
      }
    }

    if (id) {
      fetchSectionData()
    }
  }, [id, location.state, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    if (!formData.class_id) {
      setErrorMessage('Please select a class')
      return false
    }
    if (!formData.section_name.trim()) {
      setErrorMessage('Section name is required')
      return false
    }

    const sectionRegex = /^[A-Za-z]+$/
    if (!sectionRegex.test(formData.section_name)) {
      setErrorMessage('Section name should contain only letters')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setLoading(true)
    setShowError(false)

    try {
      const updateData = {
        section_id: parseInt(formData.section_id),
        class_id: parseInt(formData.class_id), // Convert to number for API
        section_name: formData.section_name.trim().toUpperCase(),
        status: parseInt(formData.status)
      }

      console.log('Sending update data:', updateData)

      await sectionService.updateSection(updateData)

      setShowSuccess(true)

      setTimeout(() => {
        navigate('/admin/sections')
      }, 1500)
    } catch (error) {
      console.error('Error updating section:', error)
      setErrorMessage(error.message || 'Failed to update section. Please try again.')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  if (loadingSection || loadingClasses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading section data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 p-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Section updated successfully!</span>
        </div>
      )}

      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/sections')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit Section</h1>
            <p className="text-gray-600 mt-1">Update section information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-500">
              Section Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Class <span className="text-red-600">*</span>
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.class_id} value={classItem.class_id.toString()}>
                      {classItem.class_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">Choose the class for this section</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Section Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="section_name"
                  value={formData.section_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                  placeholder="e.g., A, B, C"
                  maxLength="5"
                />
                <p className="text-xs text-gray-600 mt-1">Single letter or short name (e.g., A, B, Science)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">Set section status</p>
              </div>
            </div>

            {formData.class_id && (
              <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <h3 className="text-sm font-medium text-indigo-900 uppercase mb-2">Selected Class Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes
                    .filter(c => c.class_id === parseInt(formData.class_id))
                    .map((classItem) => (
                      <React.Fragment key={classItem.class_id}>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-xs text-gray-600">Class Name</div>
                          <div className="font-medium text-gray-900">{classItem.class_name}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-xs text-gray-600">Status</div>
                          <div className={`font-medium ${classItem.status === 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {classItem.status === 1 ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-10 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Section'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/sections')}
                className="bg-gray-200 text-gray-800 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSection