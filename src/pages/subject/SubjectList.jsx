// src/pages/SubjectList.js
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2, BookOpen, Edit2, Eye, Plus, Search,
  Loader, X, Check, ChevronDown, AlertTriangle
} from 'lucide-react'
import { subjectService } from '../../services/subjectService/subjectService'

// ─── Constants ────────────────────────────────────────────────
// API GET returns assessment_model as: 'scholastic' | 'co_scholastic' (lowercase)
// API PUT expects assessment_model as: 'scholastic' | 'co_scholastic' (same)
const ASSESSMENT_OPTIONS = [
  { value: 'scholastic',    label: 'Scholastic',    dot: 'bg-blue-500',    cls: 'bg-blue-100 text-blue-700' },
  { value: 'co_scholastic', label: 'Co-Scholastic', dot: 'bg-emerald-500', cls: 'bg-emerald-100 text-emerald-700' },
]

// Normalize any casing variation from API → internal key
const normalizeModel = (model) => {
  if (!model) return ''
  return model.toLowerCase().replace(/[\s-]/g, '_')
}

const getBadge = (model) => {
  const key = normalizeModel(model)
  return ASSESSMENT_OPTIONS.find(o => o.value === key) || null
}

// ─── Inline Dropdown ───────────────────────────────────────────
function InlineDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = ASSESSMENT_OPTIONS.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition min-w-[160px]"
      >
        {selected ? (
          <>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selected.dot}`} />
            <span className="font-medium text-gray-800">{selected.label}</span>
          </>
        ) : (
          <span className="text-gray-400">Select model</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 ml-auto text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {ASSESSMENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full px-3 py-2.5 flex items-center gap-2 hover:bg-purple-50 transition text-left text-sm ${value === opt.value ? 'bg-purple-50' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
              <span className="font-medium text-gray-800">{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 ml-auto text-purple-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── View Popup ────────────────────────────────────────────────
function ViewPopup({ subject, onClose }) {
  const badge = getBadge(subject.assessment_model)

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{subject.subject_name}</h2>
            <p className="text-gray-400 text-xs mt-0.5">Subject Details</p>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject Name</span>
            <span className="text-sm font-semibold text-gray-900">{subject.subject_name}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assessment Model</span>
            {badge ? (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">Not set</span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────
function SubjectList() {
  const navigate = useNavigate()

  const [subjects, setSubjects]         = useState([])
  const [filteredSubjects, setFiltered] = useState([])
  const [loading, setLoading]           = useState(true)
  const [searchTerm, setSearchTerm]     = useState('')

  // Inline edit state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({ subject_name: '', assessment_model: '' })
  const [saving, setSaving]       = useState(false)
  const [editError, setEditError] = useState('')

  // View popup
  const [viewSubject, setViewSubject] = useState(null)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  // ── Fetch ────────────────────────────────────────────────────
  const fetchSubjects = async () => {
    try {
      setLoading(true)
      // GET /getAllSubjects → { success, data: [{ subject_id, subject_name, assessment_model, status }] }
      const data = await subjectService.getAllSubjects()
      console.log('SUBJECT LIST FROM API:', data)
      setSubjects(data)
      setFiltered(data)
    } catch (err) {
      console.error(err)
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubjects() }, [])

  // ── Search ───────────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) { setFiltered(subjects); return }
    const q = searchTerm.toLowerCase()
    setFiltered(subjects.filter(s =>
      s.subject_name.toLowerCase().includes(q) ||
      (s.assessment_model || '').toLowerCase().includes(q)
    ))
  }, [searchTerm, subjects])

  // ── Start Edit ───────────────────────────────────────────────
  const startEdit = (subject) => {
    setEditError('')
    setEditingId(subject.subject_id)
    setEditForm({
      subject_name:     subject.subject_name,
      // API returns 'scholastic' or 'co_scholastic' — normalize just in case of edge cases
      assessment_model: normalizeModel(subject.assessment_model),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError('')
  }

  // ── Save (Inline Update) ─────────────────────────────────────
  const handleSave = async (subjectId) => {
    setEditError('')

    // Frontend validation
    if (!editForm.subject_name.trim())           { setEditError('Subject name is required');       return }
    if (editForm.subject_name.trim().length < 2) { setEditError('Min 2 characters required');      return }
    if (!editForm.assessment_model)              { setEditError('Please select assessment model'); return }

    const updatedName  = editForm.subject_name.trim()
    // ✅ Send exactly 'scholastic' or 'co_scholastic' — matches PUT API expectation
    const updatedModel = editForm.assessment_model

    console.log('PUT /updateSubject payload:', {
      subject_id:       subjectId,
      subject_name:     updatedName,
      assessment_model: updatedModel,
    })

    try {
      setSaving(true)

      // PUT /updateSubject → { success: true, message: "Subject updated successfully" }
      // Note: API does NOT return the updated object — we update local state manually
      const result = await subjectService.updateSubject(subjectId, {
        subject_name:     updatedName,
        assessment_model: updatedModel,
      })

      if (result.success) {
        // ✅ Update BOTH subjects & filteredSubjects
        // Table filteredSubjects se render hoti hai, isliye dono update karo
        // API PUT sirf { success, message } deta hai — updated object nahi aata
        const applyUpdate = (prev) => prev.map(s =>
          Number(s.subject_id) === Number(subjectId)
            ? { ...s, subject_name: updatedName, assessment_model: updatedModel }
            : s
        )
        setSubjects(applyUpdate)
        setFiltered(applyUpdate)  // ✅ yahi fix tha — UI filteredSubjects se render hoti hai
        setEditingId(null)
        setEditError('')
      } else {
        throw new Error(result.message || 'Update failed')
      }
    } catch (err) {
      console.error('Update error:', err)
      const msg = (err.message || '').toLowerCase()
      if (msg.includes('duplicate') || msg.includes('already exists')) {
        setEditError('Subject name already exists')
      } else {
        setEditError(err.message || 'Update failed')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      // DELETE /deleteSubject → { success, message }
      await subjectService.deleteSubject(deleteTarget.subject_id)
      // Remove from local state — no re-fetch needed
      setSubjects(prev => prev.filter(s =>
        Number(s.subject_id) !== Number(deleteTarget.subject_id)
      ))
      setDeleteTarget(null)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-14 w-14 text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading subjects...</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
              <p className="text-gray-500 text-sm mt-1">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/subject/add')}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or assessment model..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none text-sm bg-white shadow-sm"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
            {filteredSubjects.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? 'No subjects match your search' : 'No subjects yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/admin/subject/add')}
                    className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    Add First Subject
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[38%]">
                      Subject Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                      Assessment Model
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubjects.map(subject => {
                    const isEditing = editingId === subject.subject_id
                    const badge     = getBadge(subject.assessment_model)

                    return (
                      <tr
                        key={subject.subject_id}
                        className={`transition-colors ${isEditing ? 'bg-purple-50/50' : 'hover:bg-gray-50/60'}`}
                      >
                        {/* Subject Name Cell */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <div>
                              <input
                                autoFocus
                                type="text"
                                value={editForm.subject_name}
                                onChange={e => {
                                  setEditForm(p => ({ ...p, subject_name: e.target.value }))
                                  if (editError) setEditError('')
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter')  handleSave(subject.subject_id)
                                  if (e.key === 'Escape') cancelEdit()
                                }}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                placeholder="Subject name"
                                maxLength={100}
                              />
                              {editError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                  {editError}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{subject.subject_name}</span>
                            </div>
                          )}
                        </td>

                        {/* Assessment Model Cell */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <InlineDropdown
                              value={editForm.assessment_model}
                              onChange={val => {
                                setEditForm(p => ({ ...p, assessment_model: val }))
                                if (editError) setEditError('')
                              }}
                            />
                          ) : (
                            badge
                              ? (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                  {badge.label}
                                </span>
                              )
                              : <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions Cell */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSave(subject.subject_id)}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-60 shadow-sm"
                              >
                                {saving
                                  ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                  : <Check className="w-3.5 h-3.5" />
                                }
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition disabled:opacity-60"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => setViewSubject(subject)}
                                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs font-medium transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => startEdit(subject)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(subject)}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* View Popup */}
      {viewSubject && (
        <ViewPopup subject={viewSubject} onClose={() => setViewSubject(null)} />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-11 h-11 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Subject</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Are you sure you want to delete{' '}
              <strong className="text-gray-800">{deleteTarget.subject_name}</strong>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting
                  ? <><Loader className="w-4 h-4 animate-spin" /> Deleting...</>
                  : 'Delete'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SubjectList