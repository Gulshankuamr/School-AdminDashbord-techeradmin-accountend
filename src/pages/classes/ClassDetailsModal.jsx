import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { classService } from '../../services/classService/classService'
import { toast } from 'sonner'

function EditClassModal({ classItem, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    class_name: classItem?.class_name || '',
    class_order: classItem?.class_order?.toString() || '',
    class_details: classItem?.class_details || '',
    status: classItem?.status ?? 1,
  })
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'class_order' && value !== '' && !/^\d+$/.test(value)) return
    setFormData((p) => ({ ...p, [name]: value }))
    setFieldError('')
  }

  const toggleStatus = () =>
    setFormData((p) => ({ ...p, status: p.status === 1 ? 0 : 1 }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.class_name.trim()) return setFieldError('Class name is required')
    if (!formData.class_order.trim()) return setFieldError('Class order is required')
    setFieldError('')
    setSaving(true)
    try {
      await classService.updateClass({
        class_id: classItem.class_id,
        class_name: formData.class_name.trim(),
        class_order: parseInt(formData.class_order),
        class_details: formData.class_details.trim(),
        status: formData.status,
      })
      toast.success('Class updated successfully!')
      onSaved()
      onClose()
    } catch (err) {
      setFieldError(err.message || 'Failed to update class')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Edit Class</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              placeholder="e.g., Class 10"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {fieldError === 'Class name is required' && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldError}
              </p>
            )}
          </div>

          {/* Class Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Class Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="class_order"
              value={formData.class_order}
              onChange={handleChange}
              placeholder="e.g., 10"
              inputMode="numeric"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                fieldError && (fieldError.includes('order') || fieldError.toLowerCase().includes('exists'))
                  ? 'border-red-400 ring-1 ring-red-400'
                  : 'border-gray-200'
              }`}
            />
            {(fieldError.includes('order') || fieldError.toLowerCase().includes('exists')) && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError.toLowerCase().includes('exists') ? 'Class code already exists.' : fieldError}
              </p>
            )}
          </div>

          {/* Class Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Class Details
            </label>
            <textarea
              name="class_details"
              value={formData.class_details}
              onChange={handleChange}
              placeholder="Add details about this class..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <button
              type="button"
              onClick={toggleStatus}
              className="flex items-center gap-3"
            >
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  formData.status === 1 ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    formData.status === 1 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </span>
              <span className="text-sm text-gray-700">
                {formData.status === 1 ? 'Active' : 'Inactive'}
              </span>
            </button>
          </div>

          {/* Generic error (not name/order/exists) */}
          {fieldError &&
            fieldError !== 'Class name is required' &&
            !fieldError.includes('order') &&
            !fieldError.toLowerCase().includes('exists') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldError}
              </p>
            )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditClassModal