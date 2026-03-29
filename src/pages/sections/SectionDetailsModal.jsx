import React from 'react'
import { Calendar, Hash, BookOpen, Users, School, Clock } from 'lucide-react'

const SectionDetailsModal = ({ section, onClose }) => {
  if (!section) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{section.section_name}</span>
              </div>
              <div>
                <div className="text-2xl text-gray-900">Section {section.section_name}</div>
                <div className="text-sm text-gray-700 font-normal mt-1 flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  ID: {section.section_id}
                </div>
              </div>
            </h2>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Class Information Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 uppercase">Class ID</h3>
              <p className="text-xs text-blue-700">Associated class</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">{section.class_id}</div>
            <div className="text-sm text-blue-800 mt-1">Linked to Class ID</div>
          </div>
        </div>

        {/* Section Details Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-900 uppercase">Section</h3>
              <p className="text-xs text-purple-700">Section details</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-900">{section.section_name}</div>
            <div className="text-sm text-purple-800 mt-1">Section ID: {section.section_id}</div>
          </div>
        </div>
      </div>

      {/* Section Information Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Section Information</h3>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Section ID</div>
              <div className="font-medium text-gray-900">{section.section_id}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Class ID</div>
              <div className="font-medium text-gray-900">{section.class_id}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Section Name</div>
              <div className="font-medium text-gray-900">{section.section_name}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Status</div>
              <div className={`font-medium ${section.status === 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                {section.status === 1 ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Additional Information
        </h3>
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* Section ID */}
            <div className="p-4">
              <div className="text-xs text-gray-600 uppercase font-medium mb-1">Section ID</div>
              <div className="text-sm font-medium text-gray-900 font-mono">{section.section_id}</div>
            </div>
            
            {/* Class ID */}
            <div className="p-4">
              <div className="text-xs text-gray-600 uppercase font-medium mb-1">Class ID</div>
              <div className="text-sm font-medium text-gray-900 font-mono">{section.class_id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-gray-200 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Close
        </button>
        <button
          onClick={() => {
            onClose()
            // Navigate to edit page
            window.location.href = `/admin/sections/edit/${section.section_id}`
          }}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition font-medium"
        >
          Edit Section
        </button>
      </div>

      {/* Metadata Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-600 text-center">
          <p className="flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Section Information • Class ID: {section.class_id}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SectionDetailsModal