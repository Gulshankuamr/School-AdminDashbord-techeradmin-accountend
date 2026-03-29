import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { classService } from '../../services/classService/classService' //

const AddClass = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    class_name: '',
    class_order: '',
    class_details: '',
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // For class_order, only allow numbers
    if (name === 'class_order') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateForm = () => {
    if (!formData.class_name.trim()) {
      setErrorMessage('Class name is required')
      return false
    }
    if (!formData.class_order.trim()) {
      setErrorMessage('Class order is required')
      return false
    }
    if (!formData.class_details.trim()) {
      setErrorMessage('Class details are required')
      return false
    }

    // Validate class_order is a number
    if (isNaN(formData.class_order) || parseInt(formData.class_order) <= 0) {
      setErrorMessage('Class order must be a positive number')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setLoading(true)
    setShowError(false)

    try {
      // Prepare data for API
      const classData = {
        class_name: formData.class_name.trim(),
        class_order: parseInt(formData.class_order),
        class_details: formData.class_details.trim(),
      }

      await classService.createClass(classData) 

      // Success
      setShowSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/admin/classes') 
      }, 2000)
    } catch (error) {
      console.error('Error adding class:', error)
      setErrorMessage(error.message || 'Failed to add class. Please try again.')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      class_name: '',
      class_order: '',
      class_details: '',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Class added successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/classes')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Class</h1>
            <p className="text-gray-600 mt-1">Fill in the class details and information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Class Information */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
              Class Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Class Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="e.g., Class 10th, B.Com 1st Year"
                />
              </div>

              {/* Class Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Order <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="class_order"
                  value={formData.class_order}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="e.g., 1, 2, 3"
                  inputMode="numeric"
                  pattern="\d*"
                />
                <p className="text-xs text-gray-500 mt-1">Numeric order for sorting classes</p>
              </div>

              {/* Class Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Details <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="class_details"
                  value={formData.class_details}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="e.g., Science Stream, Commerce Section"
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500 mt-10">
              Additional Information
            </h2>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                rows="3"
                placeholder="Add any additional details about the class..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-10 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-3 rounded-lg transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Class'
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                disabled={loading}
              >
                Reset
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/classes')}
                className="bg-gray-200 text-gray-700 px-10 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
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

export default AddClass