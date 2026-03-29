// src/pages/EditSubject.js
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Loader, ChevronDown, CheckCircle } from 'lucide-react'
import { subjectService } from '../../services/subjectService/subjectService'

const ASSESSMENT_MODEL_OPTIONS = [
  { value: 'scholastic',    label: 'Scholastic',    description: 'Academic subjects with graded assessments' },
  { value: 'co_scholastic', label: 'Co-Scholastic', description: 'Co-curricular & activity-based subjects' },
]

const EditSubject = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading]         = useState(false)
  const [fetching, setFetching]       = useState(true)
  const [error, setError]             = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [formData, setFormData] = useState({
    subject_id:       '',
    subject_name:     '',
    assessment_model: '',
  })

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setFetching(true)
        setError('')

        if (!id) throw new Error('Subject ID is required')

        const subject = await subjectService.getSubjectById(id)

        // ✅ Normalize to lowercase_underscore so dropdown matches correctly
        const normalizedModel = subject.assessment_model
          ? subject.assessment_model.toLowerCase().replace(/[\s-]/g, '_')
          : ''

        setFormData({
          subject_id:       subject.subject_id,
          subject_name:     subject.subject_name || '',
          assessment_model: normalizedModel,
        })
      } catch (err) {
        console.error('Error fetching subject:', err)
        setError(err.message || 'Failed to load subject data')
        alert(`Error: ${err.message}`)
        navigate('/admin/subjects')
      } finally {
        setFetching(false)
      }
    }

    fetchSubject()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAssessmentSelect = (value) => {
    setFormData(prev => ({ ...prev, assessment_model: value }))
    setDropdownOpen(false)
  }

  const selectedOption = ASSESSMENT_MODEL_OPTIONS.find(o => o.value === formData.assessment_model)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.subject_id)            throw new Error('Subject ID is missing')
      if (!formData.subject_name.trim())   throw new Error('Subject name is required')
      if (!formData.assessment_model)      throw new Error('Assessment model is required')

      // ✅ Direct value sent — backend expects 'scholastic' or 'co_scholastic'
      const payload = {
        subject_name:     formData.subject_name.trim(),
        assessment_model: formData.assessment_model,
      }

      console.log('UPDATE PAYLOAD:', payload)

      const result = await subjectService.updateSubject(formData.subject_id, payload)

      console.log('Update result:', result)

      if (result.success) {
        alert('Subject updated successfully!')
        navigate('/admin/subjects')
      } else {
        throw new Error(result.message || 'Update failed')
      }
    } catch (err) {
      console.error('Error updating subject:', err)
      setError(err.message)

      const errMsg = err.message.toLowerCase()
      if (errMsg.includes('duplicate') || errMsg.includes('already exists')) {
        alert('Subject name already exists. Please use a unique name.')
      } else if (errMsg.includes('not found')) {
        alert('Subject not found. It may have been deleted.')
        navigate('/admin/subjects')
      } else {
        alert(`Failed to update subject: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading subject data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/subjects')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit Subject</h1>
            <p className="text-gray-600 mt-1">Update subject details</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Subject Information
          </h2>

          {/* Subject Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Subject Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-900"
              required
              placeholder="e.g., Mathematics, English, Science"
              minLength={2}
              maxLength={100}
            />
            <p className="text-gray-500 text-xs mt-2">
              Enter the updated subject name (2–100 characters)
            </p>
          </div>

          {/* Assessment Model Dropdown */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Assessment Model <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between transition outline-none text-left
                  ${dropdownOpen
                    ? 'border-purple-500 ring-2 ring-purple-500'
                    : 'border-gray-300 hover:border-purple-400'}
                  ${selectedOption ? 'text-gray-900' : 'text-gray-400'}
                  bg-white`}
              >
                <span>
                  {selectedOption ? (
                    <span className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        selectedOption.value === 'scholastic' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <span className="font-medium text-gray-900">{selectedOption.label}</span>
                      <span className="text-gray-400 text-sm">— {selectedOption.description}</span>
                    </span>
                  ) : (
                    'Select assessment model'
                  )}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {ASSESSMENT_MODEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAssessmentSelect(option.value)}
                      className={`w-full px-4 py-3.5 flex items-start gap-3 hover:bg-purple-50 transition text-left
                        ${formData.assessment_model === option.value ? 'bg-purple-50' : ''}
                      `}
                    >
                      <span className={`mt-1 inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        option.value === 'scholastic' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{option.description}</p>
                      </div>
                      {formData.assessment_model === option.value && (
                        <span className="ml-auto text-purple-600">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Choose how this subject will be assessed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-10 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg transition font-semibold shadow-lg hover:shadow-xl ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-700 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin h-5 w-5" />
                  Updating...
                </span>
              ) : 'Update Subject'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/subjects')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSubject