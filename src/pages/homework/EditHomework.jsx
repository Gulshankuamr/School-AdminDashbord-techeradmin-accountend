// src/pages/admin/Homework/EditHomework.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  ArrowLeft, Upload, Trash2, FileText,
  Calendar, CheckCircle2, AlertCircle, ChevronDown,
  Loader2, X,
} from 'lucide-react'

// ── Constants ────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE    = MAX_FILE_SIZE_MB * 1024 * 1024

const isPDF   = (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`
const todayISO = () => new Date().toISOString().split('T')[0]

// ── SelectField ──────────────────────────────────────────────
function SelectField({ label, required, value, onChange, disabled, placeholder, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          value={value} onChange={onChange} disabled={disabled}
          className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 text-sm text-gray-800
            bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-shadow"
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function EditHomework() {
  const { id }   = useParams()
  const navigate = useNavigate()

  // Dropdowns
  const [classes,   setClasses]   = useState([])
  const [sections,  setSections]  = useState([])
  const [subjects,  setSubjects]  = useState([])

  // Form
  const [classId,    setClassId]    = useState('')
  const [sectionId,  setSectionId]  = useState('')
  const [form, setForm] = useState({
    subject_id:   '',
    description:  '',
    due_date:     '',
  })

  // Attachments
  const [existingFiles, setExistingFiles] = useState([])   // from API
  const [newFile,       setNewFile]       = useState(null) // single new PDF

  // UI
  const [fetching,  setFetching]  = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [fileError, setFileError] = useState('')
  const [success,   setSuccess]   = useState(false)
  const [dragOver,  setDragOver]  = useState(false)

  // ── Load dropdowns ──────────────────────────────────────
  useEffect(() => {
    homeWorkService.getAllClasses().then((d)  => setClasses(d.data  || [])).catch(() => {})
    homeWorkService.getAllSubjects().then((d) => setSubjects(d.data || [])).catch(() => {})
  }, [])

  // ── Load homework ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true)
        const res = await homeWorkService.getHomeworkById(id)
        const hw  = Array.isArray(res.data) ? res.data[0] : (res.data || {})

        console.log('[EditHomework] Loaded:', hw)

        setClassId(String(hw.class_id   || ''))
        setSectionId(String(hw.section_id || ''))
        setForm({
          subject_id:  String(hw.subject_id  || ''),
          description: hw.description || hw.instructions || '',
          due_date:    hw.due_date ? hw.due_date.split('T')[0] : '',
        })
        // Normalize existing attachments
        if (hw.attachment) {
          if (Array.isArray(hw.attachment)) {
            setExistingFiles(hw.attachment)
          } else if (hw.attachment.url) {
            setExistingFiles([hw.attachment])
          }
        }
      } catch (err) {
        console.error('[EditHomework] Load error:', err)
        setError(err.message || 'Failed to load homework')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id])

  // Reload sections when classId changes
  useEffect(() => {
    if (!classId) { setSections([]); return }
    homeWorkService.getAllSections(classId)
      .then((d) => setSections(d.data || []))
      .catch(() => {})
  }, [classId])

  // ── File handling ───────────────────────────────────────
  const validateAndSetFile = (f) => {
    if (!f) return
    if (!isPDF(f)) { setFileError('Only PDF files are allowed'); return }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(`File too large. Max ${MAX_FILE_SIZE_MB}MB (yours: ${fmtSize(f.size)})`)
      return
    }
    setNewFile(f)
    setFileError('')
  }

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.due_date)           { setError('Due date is required');    return }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('homework_id', id)
      if (classId)   formData.append('class_id',   classId)
      if (sectionId) formData.append('section_id', sectionId)
      if (form.subject_id) formData.append('subject_id', form.subject_id)
      formData.append('description', form.description.trim())
      formData.append('due_date',    form.due_date)

      // Keep existing attachments by ID
      existingFiles.forEach((f) => {
        const fid = f.id || f.file_id
        if (fid) formData.append('keep_attachments[]', fid)
      })

      // New file
      if (newFile) formData.append('attachment', newFile)

      console.log('[EditHomework] UPDATE payload:',
        { id, classId, sectionId, subject_id: form.subject_id, description: form.description.trim(), due_date: form.due_date, newFile: newFile?.name }
      )

      const result = await homeWorkService.updateHomework(formData)
      console.log('[EditHomework] Update result:', result)

      setSuccess(true)
      setNewFile(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (err) {
      console.error('[EditHomework] Save error:', err)
      setError(err.message || 'Failed to update homework')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ────────────────────────────────────────
  if (fetching) {
    return (
      <div className="flex min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading homework…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectedClass = classes.find((c) => String(c.class_id) === String(classId))

  return (
    <div className="flex min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-7">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <button onClick={() => navigate('/admin/homework')}
              className="flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Homework
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/admin/homework/${id}`)}
              className="font-medium text-violet-600 hover:text-violet-700 truncate max-w-[200px] transition-colors">
              {form.description?.slice(0, 30) || 'Details'}…
            </button>
            <span>›</span>
            <span className="text-gray-600 font-semibold">Edit</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Edit Homework</h1>
            {selectedClass && (
              <p className="text-sm text-gray-400 mt-0.5">
                Updating assignment for <strong className="text-gray-600">{selectedClass.class_name}</strong>
              </p>
            )}
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-emerald-800 text-sm">Updated Successfully!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Homework has been updated for students.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/homework/${id}`)}
                  className="text-xs font-bold text-emerald-700 border border-emerald-300 bg-white px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                  View Details
                </button>
                <button onClick={() => setSuccess(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && !success && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">Update failed</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="max-w-2xl flex flex-col gap-5">

              {/* Card: Academic */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">Academic Details</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <SelectField label="Class" value={classId}
                    onChange={(e) => setClassId(e.target.value)}>
                    {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                  </SelectField>

                  <SelectField label="Section" value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    disabled={!classId || sections.length === 0}
                    placeholder={!classId ? 'Select class first' : 'All Sections'}>
                    {sections.map((s) => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
                  </SelectField>
                </div>

                <SelectField label="Subject" value={form.subject_id}
                  onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}>
                  {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </SelectField>
              </div>

              {/* Card: Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">Homework Details</h2>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={5}
                    placeholder="Detailed instructions for students…"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
                      placeholder-gray-300 resize-none leading-relaxed transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
                        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Card: Attachments */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Attachments</h2>
                  <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    PDF only · Max {MAX_FILE_SIZE_MB}MB
                  </span>
                </div>

                {/* File error */}
                {fileError && (
                  <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {fileError}
                  </div>
                )}

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setDragOver(false)
                    validateAndSetFile(e.dataTransfer.files?.[0])
                  }}
                  onClick={() => document.getElementById('hw-edit-file').click()}
                  className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 mb-4
                    ${dragOver ? 'border-violet-400 bg-violet-50 scale-[1.01]' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/20'}`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragOver ? 'text-violet-500' : 'text-gray-300'}`} />
                  <p className="text-sm font-semibold text-gray-700 mb-0.5">Click or drag to upload new PDF</p>
                  <p className="text-xs text-gray-400">PDF format only · Max {MAX_FILE_SIZE_MB}MB</p>
                  <input id="hw-edit-file" type="file" accept=".pdf,application/pdf" className="hidden"
                    onChange={(e) => { validateAndSetFile(e.target.files?.[0]); e.target.value = '' }}
                  />
                </div>

                {/* Existing files */}
                {existingFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Attachment</p>
                    <div className="flex flex-col gap-2">
                      {existingFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/60">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-amber-600" />
                          </div>
                          <p className="flex-1 text-sm font-semibold text-gray-700 truncate">
                            {file.file_name || file.name || 'Existing file'}
                          </p>
                          <button type="button" onClick={() => setExistingFiles((p) => p.filter((_, j) => j !== i))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-100 transition-colors"
                            title="Remove">
                            <Trash2 className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New file preview */}
                {newFile && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">New File</p>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50/60">
                      <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{newFile.name}</p>
                        <p className="text-xs text-gray-400">{fmtSize(newFile.size)}</p>
                      </div>
                      <button type="button" onClick={() => setNewFile(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pb-6">
                <button type="button" onClick={() => navigate(`/admin/homework/${id}`)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700
                    text-white text-sm font-bold transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed
                    shadow-sm shadow-violet-200 hover:shadow-md hover:shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0">
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Update Homework</>
                  )}
                </button>
              </div>

            </div>
          </form>
        </main>
      </div>
    </div>
  )
}