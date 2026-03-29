// src/pages/SubjectDetailsModal.js
import { BookOpen, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ASSESSMENT_MODEL_BADGE = {
  scholastic: {
    label: 'Scholastic',
    className: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  co_scholastic: {
    label: 'Co-Scholastic',
    className: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
}

const getBadge = (model) => {
  if (!model) return null
  const key = model.toLowerCase().replace(/[\s-]/g, '_')
  return ASSESSMENT_MODEL_BADGE[key] || null
}

function SubjectDetailsModal({ subject, onClose }) {
  const navigate = useNavigate()
  const badge = getBadge(subject.assessment_model)

  const handleEdit = () => {
    if (onClose) onClose()
    navigate(`/admin/subject/edit/${subject.subject_id}`)
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{subject.subject_name}</h2>
                </div>
              </div>

              {/* Assessment Model Badge */}
              {badge && (
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${badge.className}`}>
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                  {badge.label}
                </span>
              )}
            </div>

            {/* Details Grid */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subject Name</label>
                  <p className="text-gray-900 font-semibold mt-1">{subject.subject_name}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Assessment Model</label>
                  <div className="mt-1">
                    {badge ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Subject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectDetailsModal