import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { sectionService } from '../../services/sectionService/sectionService'
import { toast } from 'sonner'

const AddSection = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ class_id: '', section_name: '', capacity: '' })
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true)
        const res = await sectionService.getAllClasses()
        setClasses(res.data || [])
      } catch (err) {
        toast.error('Failed to load classes')
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [])

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    setFieldError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.class_id) return setFieldError('Please select a class')
    if (!formData.section_name.trim()) return setFieldError('Section name is required')
    if (!/^[A-Za-z]+$/.test(formData.section_name)) return setFieldError('Only letters allowed')
    if (!formData.capacity) return setFieldError('Capacity is required')
    if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) return setFieldError('Capacity must be a positive number')

    setLoading(true)
    setFieldError('')
    try {
      await sectionService.createSection({
        class_id: parseInt(formData.class_id),
        section_name: formData.section_name.trim().toUpperCase(),
        capacity: parseInt(formData.capacity),
      })
      toast.success('Section added successfully!')
      setFormData({ class_id: '', section_name: '', capacity: '' })
    } catch (err) {
      setFieldError(err.message || 'Failed to add section')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin/sections')}
            className="p-2 bg-white rounded-xl hover:bg-gray-100 transition shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Back TO List</h1>
            <p className="text-sm text-gray-500">Create a section for a class</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Select Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Class <span className="text-red-500">*</span>
              </label>
              {loadingClasses ? (
                <div className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 animate-pulse h-10" />
              ) : (
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldError.includes('class') ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Section Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="section_name"
                value={formData.section_name}
                onChange={handleChange}
                placeholder="e.g., A, B, C"
                maxLength={5}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase ${fieldError.includes('ection') ? 'border-red-400' : 'border-gray-200'}`}
              />
              <p className="text-xs text-gray-400 mt-1">Letters only, max 5 characters</p>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 40"
                min={1}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldError.includes('apacity') ? 'border-red-400' : 'border-gray-200'}`}
              />
              <p className="text-xs text-gray-400 mt-1">Maximum number of students in this section</p>
            </div>

            {/* Error */}
            {fieldError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldError}
              </p>
            )}

            {/* Selected Class Preview */}
            {formData.class_id && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Selected Class</p>
                <p className="text-sm font-semibold text-blue-900 mt-0.5">
                  {classes.find(c => c.class_id === parseInt(formData.class_id))?.class_name}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/admin/sections')}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Adding...</>
                ) : 'Add Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddSection