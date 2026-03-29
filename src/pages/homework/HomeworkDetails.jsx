// src/pages/admin/Homework/HomeworkDetails.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  ArrowLeft, Download, ExternalLink, Search,
  CheckCircle2, Clock, AlertCircle, Users,
  BookOpen, Calendar, FileText, X,
  ChevronLeft, ChevronRight, Edit2, Loader2,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────
const fmt = (d, withTime = false) => {
  if (!d) return '—'
  const date     = new Date(d)
  const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  if (!withTime) return datePart
  return `${datePart}, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
}

const fileInfo = (url = '') => {
  const ext = (url.split('.').pop() || '').toLowerCase()
  if (['jpg','jpeg','png','svg','webp'].includes(ext))
    return { icon: '🖼️', cls: 'text-green-600 bg-green-50 border-green-200' }
  if (ext === 'pdf')
    return { icon: '📕', cls: 'text-red-500 bg-red-50 border-red-200' }
  return { icon: '📄', cls: 'text-blue-500 bg-blue-50 border-blue-200' }
}
const fileName = (url = '') => url.split('/').pop() || 'Attachment'

const pctColor   = (p) => p >= 80 ? '#16a34a' : p >= 40 ? '#d97706' : '#dc2626'
const pctBg      = (p) => p >= 80 ? 'bg-green-500' : p >= 40 ? 'bg-amber-400' : 'bg-red-500'

const STATUS_STYLE = {
  submitted: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  overdue:   'bg-red-100 text-red-700',
  checked:   'bg-blue-100 text-blue-700',
  late:      'bg-orange-100 text-orange-700',
}

const ITEMS_PER_PAGE = 10

// ── FileCard ─────────────────────────────────────────────────
function FileCard({ url, label }) {
  const { icon, cls } = fileInfo(url)
  const name = fileName(url)
  return (
    <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${cls}`}>
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 text-base ${cls}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {label && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>}
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <a href={url} target="_blank" rel="noreferrer"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-current/20 bg-white/70 hover:bg-white transition-colors"
          title="Open">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a href={url} download
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-current/20 bg-white/70 hover:bg-white transition-colors"
          title="Download">
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

// ── Submission Popup ─────────────────────────────────────────
function SubmissionPopup({ student, onClose }) {
  if (!student) return null
  const submittedFile = student.submitted_file
  const fileName = submittedFile?.url ? submittedFile.url.split('/').pop() : null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        style={{ animation: 'modalIn .2s cubic-bezier(.34,1.56,.64,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-900">{student.student_name}</p>
            {student.roll_no && (
              <p className="text-xs text-gray-400 mt-0.5">Roll No: {student.roll_no}</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — only file */}
        <div className="p-5">
          {submittedFile?.url ? (
            <FileCard url={submittedFile.url} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No file submitted</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translate(-50%,-46%) scale(.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
    </>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function HomeworkDetails() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [homework,     setHomework]     = useState(null)
  const [students,     setStudents]     = useState([])
  const [summary,      setSummary]      = useState({})
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search,       setSearch]       = useState('')
  const [activeStudent, setActiveStudent] = useState(null)
  const [page,         setPage]         = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const res = await homeWorkService.getHomeworkById(id)
        console.log('[HomeworkDetails] Loaded:', res)

        // Handle both { data: {} } and { data: [{...}] }
        const hw = Array.isArray(res.data) ? res.data[0] : (res.data || {})
        setHomework(hw)
        setSummary(hw.summary   || {})
        setStudents(hw.students || [])
      } catch (err) {
        console.error('[HomeworkDetails]', err)
        setError(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const total     = Number(summary.total)     || 0
  const submitted = Number(summary.submitted) || 0
  const checked   = Number(summary.checked)   || 0
  const late      = Number(summary.late)      || 0
  const pending   = Math.max(0, total - submitted)
  const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0

  const teacherFile = homework?.attachment?.url ? homework.attachment : null

  // Filter + search
  const filtered = students.filter((s) => {
    const okStatus = statusFilter === 'All' ||
      (s.status || '').toLowerCase() === statusFilter.toLowerCase()
    const okSearch = !search ||
      (s.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(s.roll_no || '').includes(search)
    return okStatus && okSearch
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-7">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <button onClick={() => navigate('/admin/homework')}
              className="flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Homework
            </button>
            <span>›</span>
            <span className="text-gray-600 font-medium truncate max-w-xs">
              {homework?.teacher_name
                ? (homework.created_by_role === 'school_admin' ? 'School Admin' : homework.teacher_name)
                : (homework?.description || `Homework #${id}`)}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-5 w-1/3 bg-gray-100 rounded mb-3" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  <div className="h-2 bg-gray-100 rounded-full mt-6" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Failed to load homework</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
              <button onClick={() => window.location.reload()}
                className="ml-auto text-xs font-bold border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && homework && (
            <>
              {/* ── Header Card ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      {/* Teacher name — primary heading */}
                      <h1 className="text-xl font-extrabold text-gray-900 leading-snug mb-1">
                        {homework.teacher_name
                          ? (homework.created_by_role === 'school_admin' ? 'School Admin' : homework.teacher_name)
                          : (homework.created_by_name || `Homework #${homework.homework_id}`)}
                      </h1>
                      {/* Description — below name */}
                      {(homework.description) && (
                        <p className="text-sm text-gray-500 mb-2">{homework.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                        <span>Class: <strong className="text-gray-700">
                          {homework.class_name || '—'}{homework.section_name ? ` – ${homework.section_name}` : ''}
                        </strong></span>
                        <span>Subject: <strong className="text-gray-700">{homework.subject_name || '—'}</strong></span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />Due: <strong className="text-gray-700">{fmt(homework.due_date)}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />Created: <strong className="text-gray-700">{fmt(homework.created_at)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/admin/homework/edit/${id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 border border-violet-200 bg-violet-50
                      hover:bg-violet-100 px-3 py-2 rounded-xl transition-colors flex-shrink-0">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {teacherFile && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Teacher's Attachment</p>
                    <FileCard url={teacherFile.url} label={teacherFile.type?.toUpperCase()} />
                  </div>
                )}
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                  { label: 'Total Students', value: total,     icon: Users,        color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
                  { label: 'Submitted',       value: submitted, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50 border-green-100'   },
                  { label: 'Pending',         value: pending,   icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-100'   },
                  { label: 'Late',            value: late,      icon: AlertCircle,  color: 'text-red-500',    bg: 'bg-red-50 border-red-100'       },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 ${bg}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/70`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Progress ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Submission Progress</p>
                  <span className="text-sm font-extrabold" style={{ color: pctColor(pct) }}>{pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pctBg(pct)}`} style={{ width: `${pct}%` }} />
                </div>
                {checked > 0 && (
                  <p className="text-xs text-blue-500 mt-2 font-medium">
                    ✓ {checked} submission{checked > 1 ? 's' : ''} checked
                  </p>
                )}
              </div>

              {/* ── Students Table ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 flex-wrap gap-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Student Submissions
                    <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      {['All', 'Submitted', 'Pending', 'Overdue', 'Late', 'Checked'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search student…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700
                          placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 w-44"
                      />
                    </div>
                  </div>
                </div>

                {/* Hint bar */}
                <div className="px-5 py-2.5 border-b border-gray-50 bg-gray-50/60">
                  <p className="text-[11px] text-gray-400 font-medium">
                    👇 Click <span className="font-bold text-violet-500">"View Details"</span> to see a student's submitted file
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Student Name', 'Roll No', 'Submission', 'Action'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-14 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-300" />
                              </div>
                              <p className="text-sm text-gray-400">No submissions found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginated.map((s, i) => {
                          const hasFile  = !!s.submitted_file?.url
                          return (
                            <tr key={s.student_id || i} className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors">
                              {/* Student Name */}
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {(s.student_name || '?')[0].toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-gray-800">{s.student_name}</span>
                                </div>
                              </td>

                              {/* Roll No */}
                              <td className="px-5 py-4 text-gray-500 text-sm">{s.roll_no || '—'}</td>

                              {/* Submission badge */}
                              <td className="px-5 py-4">
                                {hasFile ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    Not Submitted
                                  </span>
                                )}
                              </td>

                              {/* Action */}
                              <td className="px-5 py-4">
                                {hasFile ? (
                                  <button
                                    onClick={() => setActiveStudent(s)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 border border-violet-200 bg-violet-50
                                      hover:bg-violet-600 hover:text-white hover:border-violet-600 px-3 py-1.5 rounded-lg transition-all duration-150"
                                  >
                                    View Details
                                  </button>
                                ) : (
                                  <span className="text-xs font-semibold text-gray-300">Not Submitted</span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                      {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button key={n} onClick={() => setPage(n)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors
                            ${n === safePage ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          {n}
                        </button>
                      ))}
                      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
      <SubmissionPopup student={activeStudent} onClose={() => setActiveStudent(null)} />
    </div>
  )
}