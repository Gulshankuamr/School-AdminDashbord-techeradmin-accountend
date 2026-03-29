// src/pages/admin/Homework/CreateHomework.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  Upload, X, BookOpen, Calendar, CheckCircle2,
  ChevronDown, FileText, Trash2, Plus, AlertCircle,
  Loader2, ArrowLeft,
} from 'lucide-react'

// ── Constants ────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE    = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES    = ['application/pdf']
const ALLOWED_EXT      = ['.pdf']
const todayISO         = () => new Date().toISOString().split('T')[0]

// ── Helpers ──────────────────────────────────────────────────
const isPDF = (file) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

// ── Select Field ─────────────────────────────────────────────
function SelectField({ label, required, value, onChange, disabled, children, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
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
export default function CreateHomework() {
  const navigate = useNavigate()

  // Dropdowns
  const [classes,  setClasses]  = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])

  // Form fields
  const [classId,    setClassId]    = useState('')
  const [sectionId,  setSectionId]  = useState('')
  const [subjectId,  setSubjectId]  = useState('')
  const [description, setDescription] = useState('')
  const [dueDate,    setDueDate]    = useState('')
  const [file,       setFile]       = useState(null)   // single PDF

  // UI state
  const [loading,     setLoading]     = useState(false)
  const [dragOver,    setDragOver]    = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successData, setSuccessData] = useState(null)

  // ── Load dropdowns ───────────────────────────────────────
  useEffect(() => {
    Promise.allSettled([
      homeWorkService.getAllClasses(),
      homeWorkService.getAllSubjects(),
    ]).then(([cls, sub]) => {
      if (cls.status === 'fulfilled') setClasses(cls.value?.data  || [])
      if (sub.status === 'fulfilled') setSubjects(sub.value?.data || [])
    })
  }, [])

  useEffect(() => {
    setSections([])
    setSectionId('')
    if (classId) {
      homeWorkService.getAllSections(classId)
        .then((d) => setSections(d.data || []))
        .catch(() => {})
    }
  }, [classId])

  // ── File validation ──────────────────────────────────────
  const validateAndSetFile = (incoming) => {
    if (!incoming) return

    // Only PDF
    if (!isPDF(incoming)) {
      setFieldErrors((p) => ({ ...p, file: 'Only PDF files are allowed' }))
      return
    }
    // Max 5MB
    if (incoming.size > MAX_FILE_SIZE) {
      setFieldErrors((p) => ({ ...p, file: `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed (yours: ${fmtSize(incoming.size)})` }))
      return
    }

    setFile(incoming)
    setFieldErrors((p) => { const n = { ...p }; delete n.file; return n })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) validateAndSetFile(dropped)
  }

  const handleFileInput = (e) => {
    const picked = e.target.files?.[0]
    if (picked) validateAndSetFile(picked)
    e.target.value = ''   // reset so same file can be re-picked
  }

  // ── Field-level validation ───────────────────────────────
  const validate = () => {
    const errs = {}
    if (!classId)             errs.classId     = 'Select a class'
    if (!sectionId)           errs.sectionId   = 'Select a section'
    if (!subjectId)           errs.subjectId   = 'Select a subject'
    if (!description.trim())  errs.description = 'Description is required'
    if (!dueDate)             errs.dueDate     = 'Select a due date'
    return errs
  }

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errs = validate()
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      // Scroll to first error
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('class_id',    classId)
      formData.append('section_id',  sectionId)
      formData.append('subject_id',  subjectId)
      formData.append('description', description.trim())
      formData.append('due_date',    dueDate)
      if (file) formData.append('attachment', file)

      // Debug log — remove in production
      console.log('[CreateHomework] POST payload:',
        { classId, sectionId, subjectId, description: description.trim(), dueDate, file: file?.name || null }
      )

      const result = await homeWorkService.createHomework(formData)

      console.log('[CreateHomework] API response:', result)

      // ✅ API returned success:true
      const hwId      = result?.data?.homework_id
      const subjName  = subjects.find((s) => String(s.subject_id) === String(subjectId))?.subject_name || ''
      const className = classes.find((c)  => String(c.class_id)   === String(classId))?.class_name    || ''

      setSuccessData({ hwId, subjName, className, dueDate, description: description.trim() })

      // Reset form
      setClassId(''); setSectionId(''); setSubjectId('')
      setDescription(''); setDueDate(''); setFile(null)

    } catch (err) {
      console.error('[CreateHomework] Error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Required fields tracker ──────────────────────────────
  const fields = [
    { key: 'classId',     label: 'Class',       done: !!classId },
    { key: 'sectionId',   label: 'Section',     done: !!sectionId },
    { key: 'subjectId',   label: 'Subject',     done: !!subjectId },
    { key: 'description', label: 'Description', done: !!description.trim() },
    { key: 'dueDate',     label: 'Due Date',    done: !!dueDate },
  ]
  const completedCount = fields.filter((f) => f.done).length
  const completePct    = Math.round((completedCount / fields.length) * 100)

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-7">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <button
              onClick={() => navigate('/admin/homework')}
              className="flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Homework
            </button>
            <span>›</span>
            <span className="text-gray-600 font-medium">Assign New</span>
          </div>

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Assign New Homework</h1>
            <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to assign homework to a class.</p>
          </div>

          {/* ── Global Error Banner ── */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">Failed to assign homework</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Success Banner ── */}
          {successData && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-800 text-sm">Homework Assigned Successfully!</p>
                <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                  <strong>{successData.description}</strong> · {successData.subjName} · {successData.className} · Due {successData.dueDate}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {successData.hwId && (
                  <button
                    onClick={() => navigate(`/admin/homework/${successData.hwId}`)}
                    className="text-xs font-bold text-emerald-700 border border-emerald-300 bg-white px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    View Submissions
                  </button>
                )}
                <button
                  onClick={() => setSuccessData(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex gap-6 items-start">

              {/* ── LEFT COLUMN ── */}
              <div className="flex-1 min-w-0 flex flex-col gap-5">

                {/* Card 1: Academic Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                    Academic Details
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Class */}
                    <div data-error={fieldErrors.classId ? 'true' : undefined}>
                      <SelectField
                        label="Class" required
                        value={classId}
                        onChange={(e) => {
                          setClassId(e.target.value)
                          setFieldErrors((p) => { const n = { ...p }; delete n.classId; return n })
                        }}
                      >
                        {classes.map((c) => (
                          <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                        ))}
                      </SelectField>
                      {fieldErrors.classId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {fieldErrors.classId}
                        </p>
                      )}
                    </div>

                    {/* Section */}
                    <div data-error={fieldErrors.sectionId ? 'true' : undefined}>
                      <SelectField
                        label="Section" required
                        value={sectionId}
                        onChange={(e) => {
                          setSectionId(e.target.value)
                          setFieldErrors((p) => { const n = { ...p }; delete n.sectionId; return n })
                        }}
                        disabled={!classId || sections.length === 0}
                        placeholder={!classId ? 'Select class first' : sections.length === 0 ? 'Loading...' : 'Select Section'}
                      >
                        {sections.map((s) => (
                          <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                        ))}
                      </SelectField>
                      {fieldErrors.sectionId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {fieldErrors.sectionId}
                        </p>
                      )}
                    </div>

                    {/* Subject — full width */}
                    <div className="col-span-2" data-error={fieldErrors.subjectId ? 'true' : undefined}>
                      <SelectField
                        label="Subject" required
                        value={subjectId}
                        onChange={(e) => {
                          setSubjectId(e.target.value)
                          setFieldErrors((p) => { const n = { ...p }; delete n.subjectId; return n })
                        }}
                      >
                        {subjects.map((s) => (
                          <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                        ))}
                      </SelectField>
                      {fieldErrors.subjectId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {fieldErrors.subjectId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 2: Homework Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    Homework Details
                  </h2>

                  {/* Description */}
                  <div className="mb-4" data-error={fieldErrors.description ? 'true' : undefined}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        setFieldErrors((p) => { const n = { ...p }; delete n.description; return n })
                      }}
                      placeholder="Detailed instructions for students…"
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-300
                        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
                        resize-none leading-relaxed transition-shadow
                        ${fieldErrors.description ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                    />
                    {fieldErrors.description && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div data-error={fieldErrors.dueDate ? 'true' : undefined}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Due Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dueDate}
                        min={todayISO()}
                        onChange={(e) => {
                          setDueDate(e.target.value)
                          setFieldErrors((p) => { const n = { ...p }; delete n.dueDate; return n })
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800
                          focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow
                          ${fieldErrors.dueDate ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {fieldErrors.dueDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card 3: Attachment */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-violet-400" />
                      Attachment
                    </h2>
                    <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      Optional · PDF only · Max {MAX_FILE_SIZE_MB}MB
                    </span>
                  </div>

                  {/* File error */}
                  {fieldErrors.file && (
                    <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {fieldErrors.file}
                    </div>
                  )}

                  {!file ? (
                    /* Drop Zone */
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('hw-file-input').click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                        ${dragOver
                          ? 'border-violet-400 bg-violet-50 scale-[1.01]'
                          : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/20'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors
                        ${dragOver ? 'bg-violet-100' : 'bg-gray-50 border border-gray-200'}`}>
                        <Upload className={`w-5 h-5 transition-colors ${dragOver ? 'text-violet-600' : 'text-gray-400'}`} />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {dragOver ? 'Drop your PDF here' : 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-400">PDF format only · Maximum {MAX_FILE_SIZE_MB}MB</p>
                      <input
                        id="hw-file-input"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </div>
                  ) : (
                    /* File Preview */
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-200 bg-red-50/60">
                      <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">PDF · {fmtSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/homework')}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700
                      text-white text-sm font-bold transition-all duration-200
                      disabled:opacity-60 disabled:cursor-not-allowed
                      shadow-sm shadow-violet-200 hover:shadow-md hover:shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Assigning…</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Assign Homework</>
                    )}
                  </button>
                </div>
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div className="w-52 flex-shrink-0 flex flex-col gap-4 sticky top-6">

                {/* Progress tracker */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completion</p>
                    <span className="text-sm font-extrabold text-violet-600">{completePct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${completePct}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {fields.map(({ key, label, done }) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                          ${done ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                          {done && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium transition-colors ${done ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2.5">💡 Tips</p>
                  <ul className="text-xs text-violet-700 leading-relaxed space-y-1.5 list-disc list-inside">
                    <li>Select class first, then section</li>
                    <li>Past dates are disabled</li>
                    <li>Only PDF format accepted</li>
                    <li>Max file size: {MAX_FILE_SIZE_MB}MB</li>
                  </ul>
                </div>

              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}