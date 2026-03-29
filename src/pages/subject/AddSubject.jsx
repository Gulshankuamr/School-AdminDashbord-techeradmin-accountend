// src/pages/SubjectManager.jsx
// ✅ Single page: Add form (top) + Live subject list (bottom)
// ✅ Instant optimistic updates, inline edit/delete, search, pagination
// ✅ No page reload, no navigation on add

import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Plus, Search, Check, X, Edit2, Trash2,
  ChevronDown, Loader, AlertTriangle, Eye, CheckCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { subjectService } from '../../services/subjectService/subjectService'

// ─── Constants ──────────────────────────────────────────────────────────────
const ASSESSMENT_OPTIONS = [
  {
    value: 'scholastic',
    label: 'Scholastic',
    description: 'Academic subjects with graded assessments',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'co_scholastic',
    label: 'Co-Scholastic',
    description: 'Co-curricular & activity-based subjects',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
]

const PAGE_SIZE = 8

const normalizeModel = (m) =>
  m ? m.toLowerCase().replace(/[\s-]/g, '_') : ''

const getBadge = (model) =>
  ASSESSMENT_OPTIONS.find((o) => o.value === normalizeModel(model)) || null

// ─── Small reusable: Assessment Dropdown ────────────────────────────────────
function AssessmentDropdown({ value, onChange, placeholder = 'Select assessment model', size = 'md' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = ASSESSMENT_OPTIONS.find((o) => o.value === value)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const py = size === 'sm' ? 'py-1.5' : 'py-2.5'
  const px = size === 'sm' ? 'px-3' : 'px-4'
  const text = size === 'sm' ? 'text-sm' : 'text-sm'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full ${px} ${py} border rounded-lg flex items-center justify-between gap-2 bg-white transition outline-none
          ${open ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'}
          ${selected ? 'text-gray-900' : 'text-gray-400'} ${text}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selected.dot}`} />
              <span className="font-medium">{selected.label}</span>
              {size !== 'sm' && (
                <span className="text-gray-400 text-xs hidden sm:inline">— {selected.description}</span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {ASSESSMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-violet-50 transition text-left
                ${value === opt.value ? 'bg-violet-50' : ''}`}
            >
              <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
              </div>
              {value === opt.value && <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── View Popup ─────────────────────────────────────────────────────────────
function ViewPopup({ subject, onClose, onEdit }) {
  const badge = getBadge(subject.assessment_model)
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{subject.subject_name}</h2>
            <p className="text-gray-400 text-xs">Subject Details</p>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject Name</span>
            <span className="text-sm font-semibold text-gray-900">{subject.subject_name}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assessment</span>
            {badge ? (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">Not set</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={() => { onEdit(subject); onClose() }}
            className="flex-1 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({ subject, onCancel, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Subject</h3>
        <p className="text-gray-500 text-sm text-center mb-6">
          Delete <span className="font-semibold text-gray-800">"{subject.subject_name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? <><Loader className="w-4 h-4 animate-spin" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Toast Notification ──────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium
      animate-in slide-in-from-top-2 fade-in duration-300
      ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
    >
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
        : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SubjectManager() {
  // ── Data ─────────────────────────────────────────────────────
  const [subjects, setSubjects]   = useState([])
  const [loading, setLoading]     = useState(true)

  // ── Add Form ──────────────────────────────────────────────────
  const [addForm, setAddForm]         = useState({ subject_name: '', assessment_model: '' })
  const [addLoading, setAddLoading]   = useState(false)
  const [addError, setAddError]       = useState('')

  // ── Search & Pagination ───────────────────────────────────────
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  // ── Inline Edit ───────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({ subject_name: '', assessment_model: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError]     = useState('')

  // ── Modals ────────────────────────────────────────────────────
  const [viewSubject, setViewSubject]     = useState(null)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleting, setDeleting]           = useState(false)

  // ── Toast ─────────────────────────────────────────────────────
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Fetch all ─────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const data = await subjectService.getAllSubjects()
        setSubjects(data)
      } catch (err) {
        showToast(err.message || 'Failed to load subjects', 'error')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── Filtered + Paginated ──────────────────────────────────────
  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.subject_name.toLowerCase().includes(q) ||
      (s.assessment_model || '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1) }, [search])

  // ── Add Subject ───────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault()
    setAddError('')

    if (!addForm.subject_name.trim())         { setAddError('Subject name is required'); return }
    if (addForm.subject_name.trim().length < 2) { setAddError('Min 2 characters required'); return }
    if (!addForm.assessment_model)             { setAddError('Please select an assessment model'); return }

    setAddLoading(true)

    // Optimistic: add temp entry immediately
    const tempId  = `temp-${Date.now()}`
    const tempRow = {
      subject_id:       tempId,
      subject_name:     addForm.subject_name.trim(),
      assessment_model: addForm.assessment_model,
      _pending:         true,
    }
    setSubjects((prev) => [tempRow, ...prev])
    setAddForm({ subject_name: '', assessment_model: '' })

    try {
      const result = await subjectService.addSubject({
        subject_name:     tempRow.subject_name,
        assessment_model: tempRow.assessment_model,
      })

      if (result.success) {
        // Replace temp with real id from API
        const realId = result.data?.subject_id || tempId
        setSubjects((prev) =>
          prev.map((s) =>
            s.subject_id === tempId
              ? { ...s, subject_id: realId, _pending: false }
              : s
          )
        )
        showToast('Subject added successfully!')
      } else {
        throw new Error(result.message || 'Failed to add subject')
      }
    } catch (err) {
      // Rollback optimistic entry
      setSubjects((prev) => prev.filter((s) => s.subject_id !== tempId))
      const msg = (err.message || '').toLowerCase()
      const friendly = msg.includes('duplicate') || msg.includes('already exists')
        ? 'Subject name already exists'
        : err.message || 'Failed to add subject'
      setAddError(friendly)
    } finally {
      setAddLoading(false)
    }
  }

  // ── Start inline edit ─────────────────────────────────────────
  const startEdit = (subject) => {
    setEditError('')
    setEditingId(subject.subject_id)
    setEditForm({
      subject_name:     subject.subject_name,
      assessment_model: normalizeModel(subject.assessment_model),
    })
  }

  const cancelEdit = () => { setEditingId(null); setEditError('') }

  // ── Save inline edit ──────────────────────────────────────────
  const handleSave = async (subjectId) => {
    setEditError('')
    if (!editForm.subject_name.trim())           { setEditError('Name is required'); return }
    if (editForm.subject_name.trim().length < 2) { setEditError('Min 2 characters'); return }
    if (!editForm.assessment_model)              { setEditError('Select assessment model'); return }

    setEditLoading(true)

    const updName  = editForm.subject_name.trim()
    const updModel = editForm.assessment_model

    // Optimistic update
    const prev = subjects.find((s) => Number(s.subject_id) === Number(subjectId))
    setSubjects((all) =>
      all.map((s) =>
        Number(s.subject_id) === Number(subjectId)
          ? { ...s, subject_name: updName, assessment_model: updModel }
          : s
      )
    )
    setEditingId(null)

    try {
      const result = await subjectService.updateSubject(subjectId, {
        subject_name:     updName,
        assessment_model: updModel,
      })
      if (!result.success) throw new Error(result.message || 'Update failed')
      showToast('Subject updated!')
    } catch (err) {
      // Rollback
      if (prev) {
        setSubjects((all) =>
          all.map((s) =>
            Number(s.subject_id) === Number(subjectId) ? prev : s
          )
        )
      }
      const msg = (err.message || '').toLowerCase()
      const friendly = msg.includes('duplicate') || msg.includes('already exists')
        ? 'Subject name already exists'
        : err.message || 'Update failed'
      setEditError(friendly)
      setEditingId(subjectId) // re-open edit row on error
      setEditForm({ subject_name: updName, assessment_model: updModel })
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const id = deleteTarget.subject_id
    // Optimistic
    setSubjects((prev) => prev.filter((s) => Number(s.subject_id) !== Number(id)))
    setDeleteTarget(null)
    try {
      await subjectService.deleteSubject(id)
      showToast('Subject deleted')
    } catch (err) {
      // Re-fetch on failure to restore
      try {
        const data = await subjectService.getAllSubjects()
        setSubjects(data)
      } catch (_) {}
      showToast(err.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      <div className="min-h-screen bg-gray-50/80 p-4 sm:p-6">
        <div className="w-full space-y-5">

          {/* ── Page Header ──────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-violet-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Subject Manager</h1>
              <p className="text-gray-400 text-sm mt-0.5">Add and manage all subjects</p>
            </div>
          </div>

          {/* ── ADD FORM ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-500" />
              Add New Subject
            </h2>

            {addError && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-600 text-sm">{addError}</p>
              </div>
            )}

            <form onSubmit={handleAdd}>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Subject Name */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={addForm.subject_name}
                    onChange={(e) => {
                      setAddForm((p) => ({ ...p, subject_name: e.target.value }))
                      if (addError) setAddError('')
                    }}
                    placeholder="Subject name  e.g. Mathematics"
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white
                      focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none transition placeholder-gray-300"
                  />
                </div>

                {/* Assessment Dropdown */}
                <div className="sm:w-64">
                  <AssessmentDropdown
                    value={addForm.assessment_model}
                    onChange={(v) => {
                      setAddForm((p) => ({ ...p, assessment_model: v }))
                      if (addError) setAddError('')
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg
                    hover:bg-violet-700 active:scale-95 transition font-semibold text-sm shadow-sm shadow-violet-200
                    disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {addLoading
                    ? <><Loader className="w-4 h-4 animate-spin" /> Adding...</>
                    : <><Plus className="w-4 h-4" /> Add Subject</>}
                </button>
              </div>
            </form>
          </div>

          {/* ── SUBJECT LIST ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">

            {/* List Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-700">All Subjects</h2>
                <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-bold rounded-full">
                  {subjects.length}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50
                    focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none transition placeholder-gray-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <Loader className="w-8 h-8 animate-spin text-violet-400" />
                <p className="text-sm">Loading subjects...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">
                  {search ? 'No subjects match your search' : 'No subjects yet. Add one above!'}
                </p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/60">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[5%]">#</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[38%]">Subject Name</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[28%]">Assessment Model</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.map((subject, idx) => {
                        const isEditing = editingId === subject.subject_id
                        const badge     = getBadge(subject.assessment_model)
                        const rowNum    = (safePage - 1) * PAGE_SIZE + idx + 1

                        return (
                          <tr
                            key={subject.subject_id}
                            className={`transition-colors ${subject._pending ? 'opacity-60' : ''} ${isEditing ? 'bg-violet-50/40' : 'hover:bg-gray-50/50'}`}
                          >
                            {/* # */}
                            <td className="px-5 py-3 text-xs text-gray-300 font-medium">{rowNum}</td>

                            {/* Subject Name */}
                            <td className="px-5 py-3">
                              {isEditing ? (
                                <div>
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editForm.subject_name}
                                    onChange={(e) => {
                                      setEditForm((p) => ({ ...p, subject_name: e.target.value }))
                                      if (editError) setEditError('')
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter')  handleSave(subject.subject_id)
                                      if (e.key === 'Escape') cancelEdit()
                                    }}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900
                                      focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none bg-white"
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
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-800">
                                    {subject.subject_name}
                                    {subject._pending && (
                                      <span className="ml-2 text-xs text-gray-300 font-normal">saving...</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Assessment Model */}
                            <td className="px-5 py-3">
                              {isEditing ? (
                                <div className="w-48">
                                  <AssessmentDropdown
                                    value={editForm.assessment_model}
                                    onChange={(v) => {
                                      setEditForm((p) => ({ ...p, assessment_model: v }))
                                      if (editError) setEditError('')
                                    }}
                                    size="sm"
                                  />
                                </div>
                              ) : badge ? (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.badge}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                  {badge.label}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSave(subject.subject_id)}
                                    disabled={editLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold
                                      hover:bg-violet-700 transition disabled:opacity-60 shadow-sm"
                                  >
                                    {editLoading
                                      ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                      : <Check className="w-3.5 h-3.5" />}
                                    {editLoading ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    disabled={editLoading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                                  >
                                    <X className="w-3.5 h-3.5" /> Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setViewSubject(subject)}
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-600 text-xs font-medium transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> View
                                  </button>
                                  <button
                                    onClick={() => startEdit(subject)}
                                    disabled={!!subject._pending}
                                    className="flex items-center gap-1 text-emerald-500 hover:text-emerald-700 text-xs font-medium transition disabled:opacity-30"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(subject)}
                                    disabled={!!subject._pending}
                                    className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-medium transition disabled:opacity-30"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition
                            ${n === safePage
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewSubject && (
        <ViewPopup
          subject={viewSubject}
          onClose={() => setViewSubject(null)}
          onEdit={startEdit}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          subject={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      )}
    </>
  )
}