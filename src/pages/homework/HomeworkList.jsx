// src/pages/admin/Homework/HomeworkList.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeWorkService } from '../../services/homeWorkService/homeWorkService'
import Sidebar from '../../components/Sidebar'
import Navbar  from '../../components/Navbar'
import {
  Plus, RefreshCw, BookOpen, Calendar, Users,
  ChevronRight, AlertCircle, Loader2,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const pctColor = (p) => p >= 80 ? 'text-green-600' : p >= 40 ? 'text-amber-500' : 'text-red-500'
const pctBg    = (p) => p >= 80 ? 'bg-green-500'   : p >= 40 ? 'bg-amber-400'   : 'bg-red-500'
const pctBgLight = (p) => p >= 80 ? 'bg-green-50 border-green-200' : p >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

// ── Select ───────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, children }) {
  return (
    <div className="flex-1 min-w-[130px]">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      <select
        value={value} onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white
          focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow"
      >
        {children}
      </select>
    </div>
  )
}

// ── Homework Card ────────────────────────────────────────────
function HomeworkCard({ hw, onView }) {
  const total     = Number(hw.total_students)  || 0
  const submitted = Number(hw.submitted_count) || 0
  const overdue   = Number(hw.overdue_count)   || 0
  const pending   = Math.max(0, total - submitted - overdue)
  const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0

  const attachUrl  = hw.attachment?.url || (typeof hw.attachment === 'string' ? hw.attachment : null)
  const attachName = hw.attachment?.file_name || hw.attachment_name ||
    (attachUrl ? attachUrl.split('/').pop() : null)

  const teacherLabel = hw.teacher_name
    ? (hw.created_by_role === 'school_admin' ? 'School Admin' : hw.teacher_name)
    : (hw.created_by_name || null)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Top accent bar — color by submission % */}
      <div className={`h-1 w-full ${pctBg(pct)}`} />

      <div className="p-5">
        {/* ── Header row ── */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
            <BookOpen className="w-5 h-5 text-violet-600" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">

            {/* Teacher name */}
            {teacherLabel && (
              <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">
                {teacherLabel}
              </p>
            )}

            {/* Student Details row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                <Users className="w-3 h-3" />
                {hw.class_name}{hw.section_name ? ` – ${hw.section_name}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                {hw.subject_name || '—'}
              </span>
              {total > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                  {total} students
                </span>
              )}
            </div>

            {/* Note: description */}
            <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
              <span className="font-bold text-gray-700">Note: </span>
              {hw.description || hw.title || hw.homework_title || 'No description provided'}
            </p>

            {/* Due date */}
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: <strong className="text-gray-600">{fmt(hw.due_date)}</strong>
            </p>
          </div>
        </div>

        {/* Attachment pill */}
        {attachUrl && attachName && (
          <div className="mb-4">
            <a href={attachUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors">
              📕 {attachName}
            </a>
          </div>
        )}

        {/* ── Stats + Progress ── */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="text-gray-500">Total <strong className="text-gray-800">{total}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-green-600 font-semibold">{submitted} Submitted</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-amber-500 font-semibold">{pending} Pending</span>
              </span>
              {overdue > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <span className="text-red-500 font-semibold">{overdue} Overdue</span>
                </span>
              )}
            </div>
            <span className={`text-xs font-extrabold ${pctColor(pct)}`}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pctBg(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={() => onView(hw.homework_id || hw.id)}
            className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 border border-violet-200 bg-violet-50
              hover:bg-violet-700 hover:text-white hover:border-violet-700 px-4 py-2 rounded-xl transition-all duration-200 group-hover:shadow-sm"
          >
            View Submissions <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function HomeworkList() {
  const navigate = useNavigate()

  const [allHomeworks, setAllHomeworks]     = useState([])
  const [loading,      setLoading]          = useState(true)
  const [error,        setError]            = useState(null)
  const [classes,      setClasses]          = useState([])
  const [subjects,     setSubjects]         = useState([])

  const [selClass,   setSelClass]   = useState('')
  const [selSubject, setSelSubject] = useState('')
  const [selStatus,  setSelStatus]  = useState('')

  // Load filter options
  useEffect(() => {
    homeWorkService.getAllClasses().then((d)  => setClasses(d.data  || [])).catch(() => {})
    homeWorkService.getAllSubjects().then((d) => setSubjects(d.data || [])).catch(() => {})
  }, [])

  // Fetch homeworks
  const fetchHomework = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await homeWorkService.getAllHomeworks()
      console.log('[HomeworkList] Loaded:', data.data?.length, 'items')
      setAllHomeworks(data.data || [])
    } catch (err) {
      console.error('[HomeworkList]', err)
      setError(err.message || 'Failed to load homeworks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHomework() }, [fetchHomework])

  // Client-side filter
  const homeworks = allHomeworks.filter((hw) => {
    const okClass   = !selClass   || (hw.class_name   || '').toLowerCase() === selClass.toLowerCase()
    const okSubject = !selSubject || (hw.subject_name || '').toLowerCase() === selSubject.toLowerCase()

    if (!selStatus) return okClass && okSubject

    const hwStatus  = (hw.status || '').toLowerCase()
    const isSubmitted = hwStatus === 'submitted' || Number(hw.submitted_count) > 0
    const isPending   = hwStatus === 'pending'   || (Number(hw.pending_count)   > 0 && Number(hw.submitted_count) === 0)
    const isOverdue   = hwStatus === 'overdue'   || Number(hw.overdue_count)   > 0
    const isActive    = hwStatus === 'active'    || (!isOverdue && !isSubmitted)
    const sel = selStatus.toLowerCase()
    const okStatus = (sel === 'submitted' && isSubmitted) ||
                     (sel === 'pending'   && isPending)   ||
                     (sel === 'overdue'   && isOverdue)   ||
                     (sel === 'active'    && isActive)    ||
                     hwStatus === sel

    return okClass && okSubject && okStatus
  })

  const hasFilters = !!(selClass || selSubject || selStatus)
  const handleReset = () => { setSelClass(''); setSelSubject(''); setSelStatus('') }

  return (
    <div className="flex min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans','Nunito',sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-7">

          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                <span className="cursor-pointer hover:text-violet-600 transition-colors"
                  onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                {' › '}
                <span className="text-gray-600 font-medium">Homework</span>
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Homework Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {!loading && `${allHomeworks.length} total assignment${allHomeworks.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/homework/create')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold
                px-5 py-2.5 rounded-xl shadow-sm shadow-violet-200 hover:shadow-md hover:shadow-violet-200
                hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> Assign Homework
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <FilterSelect label="Class" value={selClass} onChange={(e) => setSelClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c.class_id} value={c.class_name}>{c.class_name}</option>)}
              </FilterSelect>

              <FilterSelect label="Subject" value={selSubject} onChange={(e) => setSelSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map((s) => <option key={s.subject_id} value={s.subject_name}>{s.subject_name}</option>)}
              </FilterSelect>

              <FilterSelect label="Status" value={selStatus} onChange={(e) => setSelStatus(e.target.value)}>
                <option value="">All Status</option>
                {['Active', 'Submitted', 'Pending', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
              </FilterSelect>

              {hasFilters && (
                <button onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors self-end">
                  Reset
                </button>
              )}

              <button onClick={fetchHomework}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors self-end"
                title="Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl text-sm font-medium mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
              <button onClick={fetchHomework} className="ml-auto text-xs font-bold underline">Retry</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-1/2 bg-gray-100 rounded mb-2" />
                      <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && homeworks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-violet-50 border-2 border-dashed border-violet-200 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-violet-300" strokeWidth={1.2} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
                  🔍
                </div>
              </div>

              {hasFilters ? (
                <>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">No Results Found</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-4">
                    No homework matches your current filters.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {selClass && (
                      <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full">
                        Class: {selClass}
                      </span>
                    )}
                    {selSubject && (
                      <span className="text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full">
                        Subject: {selSubject}
                      </span>
                    )}
                    {selStatus && (
                      <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                        Status: {selStatus}
                      </span>
                    )}
                  </div>
                  <button onClick={handleReset}
                    className="flex items-center gap-2 bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">No Homework Assigned Yet</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                    Start by assigning the first homework to a class.
                  </p>
                  <button onClick={() => navigate('/admin/homework/create')}
                    className="flex items-center gap-2 bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
                    <Plus className="w-4 h-4" /> Assign Homework
                  </button>
                </>
              )}
            </div>
          )}

          {/* Homework cards */}
          {!loading && !error && homeworks.length > 0 && (
            <div className="flex flex-col gap-4">
              {homeworks.map((hw) => (
                <HomeworkCard
                  key={hw.homework_id || hw.id}
                  hw={hw}
                  onView={(id) => navigate(`/admin/homework/${id}`)}
                />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}