import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Save, RotateCcw, Search, List,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, GraduationCap, Sparkles,
} from 'lucide-react'
import { coScholasticGradeService } from '../../services/examService/coScholasticGradeService'
import { API_BASE_URL, getAuthToken } from '../../services/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D']

const GRADE_COLORS = {
  A1: { sel: 'bg-emerald-100 text-emerald-800 border-emerald-300', badge: 'bg-emerald-100 text-emerald-800' },
  A2: { sel: 'bg-teal-100 text-teal-800 border-teal-300',         badge: 'bg-teal-100 text-teal-800' },
  B1: { sel: 'bg-blue-100 text-blue-800 border-blue-300',         badge: 'bg-blue-100 text-blue-800' },
  B2: { sel: 'bg-violet-100 text-violet-800 border-violet-300',   badge: 'bg-violet-100 text-violet-800' },
  C1: { sel: 'bg-amber-100 text-amber-800 border-amber-300',      badge: 'bg-amber-100 text-amber-800' },
  C2: { sel: 'bg-orange-100 text-orange-800 border-orange-300',   badge: 'bg-orange-100 text-orange-800' },
  D:  { sel: 'bg-rose-100 text-rose-800 border-rose-300',         badge: 'bg-rose-100 text-rose-800' },
}

const ACADEMIC_YEARS = Array.from({ length: 7 }, (_, i) => {
  const s = 2026 + i
  return `${s}-${String(s + 1).slice(2)}`
})

const TERMS = [
  { value: 'term1', label: 'Term 1' },
  { value: 'term2', label: 'Term 2' },
]

const PAGE_SIZE = 10

// ─── Fetch helpers ─────────────────────────────────────────────────────────────

function authHdr() {
  return { Authorization: `Bearer ${getAuthToken()}` }
}

async function apiGet(path) {
  const res  = await fetch(`${API_BASE_URL}${path}`, { headers: authHdr() })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message || `Failed: ${path}`)
  return json.data || []
}

// GET /schooladmin/getAllClasses
const fetchClasses = () => apiGet('/schooladmin/getAllClasses')

// GET /schooladmin/getAllSections?class_id=X
const fetchSections = (cid) => apiGet(`/schooladmin/getAllSections?class_id=${cid}`)

// GET /schooladmin/getTotalStudentsListBySchoolId?class_id=X&section_id=Y
const fetchStudents = (cid, sid) =>
  apiGet(`/schooladmin/getTotalStudentsListBySchoolId?class_id=${cid}&section_id=${sid}`)

// GET /schooladmin/getAllSubjects → filter assessment_model === 'co_scholastic'
async function fetchCoSubjects() {
  const all = await apiGet('/schooladmin/getAllSubjects')
  return all.filter(s => s.assessment_model === 'co_scholastic')
}

// ─── Grade Select ─────────────────────────────────────────────────────────────

function GradeSelect({ value, onChange }) {
  const colors = value ? GRADE_COLORS[value]?.sel : ''
  return (
    <div className="relative inline-flex">
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={[
          'appearance-none w-[84px] h-[30px] pl-2.5 pr-5 rounded-lg border text-xs font-bold',
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
          value ? colors : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300',
        ].join(' ')}
      >
        <option value="">—</option>
        {GRADE_OPTIONS.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={[
          'flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold',
          'animate-[toastIn_0.3s_ease]',
          t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white',
        ].join(' ')}>
          {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CreateCoScholasticGrades() {
  const navigate = useNavigate()

  // filters
  const [academicYear,      setAcademicYear]      = useState(ACADEMIC_YEARS[0])
  const [term,              setTerm]              = useState('term1')
  const [classes,           setClasses]           = useState([])
  const [classesLoading,    setClassesLoading]    = useState(true)
  const [selectedClassId,   setSelectedClassId]   = useState('')
  const [sections,          setSections]          = useState([])
  const [sectionsLoading,   setSectionsLoading]   = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState('')

  // data
  const [students,    setStudents]    = useState([])
  const [coSubjects,  setCoSubjects]  = useState([])
  // localGrades[`${student_id}_${subject_id}`] = grade string
  const [localGrades, setLocalGrades] = useState({})
  // origGrades[`${student_id}_${subject_id}`] = { co_scholastic_grades_id, grade }
  const [origGrades,  setOrigGrades]  = useState({})
  const [dirty,       setDirty]       = useState(false)

  // ui
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [toasts,   setToasts]   = useState([])
  const tid = useRef(0)

  function toast(msg, type = 'success') {
    const id = ++tid.current
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }

  // load classes
  useEffect(() => {
    fetchClasses()
      .then(d => { setClasses(d); if (d.length) setSelectedClassId(String(d[0].class_id)) })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setClassesLoading(false))
  }, [])

  // load sections on class change
  useEffect(() => {
    if (!selectedClassId) { setSections([]); setSelectedSectionId(''); return }
    setSectionsLoading(true); setSections([]); setSelectedSectionId(''); setLoaded(false)
    fetchSections(selectedClassId)
      .then(d => { setSections(d); if (d.length) setSelectedSectionId(String(d[0].section_id)) })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setSectionsLoading(false))
  }, [selectedClassId])

  // LOAD button
  async function handleLoad() {
    if (!selectedClassId || !selectedSectionId) { toast('Select class and section', 'error'); return }
    setLoading(true); setLoaded(false)
    try {
      // parallel: students + all co-scholastic subjects
      const [studs, subs] = await Promise.all([
        fetchStudents(selectedClassId, selectedSectionId),
        fetchCoSubjects(),
      ])
      setStudents(studs)
      setCoSubjects(subs)

      // fetch existing grades per student (parallel)
      const gradeMap = {}
      const origMap  = {}

      const results = await Promise.all(
        studs.map(s =>
          coScholasticGradeService
            .getCoScholasticGrades({ student_id: s.student_id, academic_year: academicYear })
            .then(r => ({ sid: s.student_id, rows: r.data || [] }))
            .catch(() => ({ sid: s.student_id, rows: [] }))
        )
      )

      results.forEach(({ sid, rows }) => {
        rows.forEach(row => {
          if (row.term !== term) return   // only current term
          const key     = `${sid}_${row.subject_id}`
          gradeMap[key] = row.grade
          origMap[key]  = { co_scholastic_grades_id: row.co_scholastic_grades_id, grade: row.grade }
        })
      })

      setLocalGrades(gradeMap)
      setOrigGrades(origMap)
      setDirty(false)
      setLoaded(true)
      setPage(1); setSearch('')
    } catch (e) {
      toast(e.message || 'Load failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleGradeChange(studentId, subjectId, grade) {
    setLocalGrades(p => ({ ...p, [`${studentId}_${subjectId}`]: grade }))
    setDirty(true)
  }

  function handleReset() {
    const r = {}
    Object.entries(origGrades).forEach(([k, v]) => { r[k] = v.grade })
    setLocalGrades(r); setDirty(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const ops = []
      students.forEach(s => {
        coSubjects.forEach(sub => {
          const key   = `${s.student_id}_${sub.subject_id}`
          const grade = localGrades[key]
          const orig  = origGrades[key]
          if (!grade) return
          if (!orig) {
            ops.push(coScholasticGradeService.createCoScholasticGrade({
              student_id: s.student_id, subject_id: sub.subject_id,
              term, grade, academic_year: academicYear,
            }))
          } else if (orig.grade !== grade) {
            ops.push(coScholasticGradeService.updateCoScholasticGrade(orig.co_scholastic_grades_id, grade))
          }
        })
      })
      if (!ops.length) { toast('No changes to save', 'error'); setSaving(false); return }
      await Promise.all(ops)
      // sync originals
      const newOrig = { ...origGrades }
      Object.entries(localGrades).forEach(([k, g]) => {
        if (g) newOrig[k] = { ...(newOrig[k] || {}), grade: g }
      })
      setOrigGrades(newOrig); setDirty(false)
      toast('Grades saved successfully!')
    } catch (e) {
      toast(e.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filtered   = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || String(s.roll_no ?? '').includes(search)
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const className  = classes.find(c  => String(c.class_id)   === selectedClassId)?.class_name    || ''
  const secName    = sections.find(s => String(s.section_id) === selectedSectionId)?.section_name || ''

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-24">
      <style>{`
        @keyframes toastIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
      `}</style>

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          Academic Management
          <span className="text-slate-300 mx-0.5">›</span>
          <span className="text-indigo-500">Co-Scholastic Grades</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              Co-Scholastic Grades
              {/* <Sparkles className="w-5 h-5 text-indigo-400" /> */}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Assign grades for extracurricular & personal development subjects.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={() => navigate('/admin/exams/co-scholastic/list')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
            >
              <List className="w-3.5 h-3.5" />
              View All List
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Academic Year</label>
              <select value={academicYear} onChange={e => { setAcademicYear(e.target.value); setLoaded(false) }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class</label>
              {classesLoading
                ? <div className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3 gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading…</div>
                : <select value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setLoaded(false) }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                    <option value="">— Select class —</option>
                    {classes.map(c => <option key={c.class_id} value={String(c.class_id)}>{c.class_name}</option>)}
                  </select>
              }
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
              {sectionsLoading
                ? <div className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3 gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading…</div>
                : <select value={selectedSectionId} onChange={e => { setSelectedSectionId(e.target.value); setLoaded(false) }}
                    disabled={!sections.length}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50">
                    <option value="">— Select section —</option>
                    {sections.map(s => <option key={s.section_id} value={String(s.section_id)}>{s.section_name}</option>)}
                  </select>
              }
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Term</label>
              <select value={term} onChange={e => { setTerm(e.target.value); setLoaded(false) }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                {TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <button onClick={handleLoad} disabled={loading || !selectedClassId || !selectedSectionId}
              className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Loading…</> : <><BookOpen className="w-4 h-4" />Load</>}
            </button>
          </div>
        </div>

        {/* ── Grade Table ── */}
        {loaded && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeUp_0.35s_ease]">

            {/* Toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search by name or roll no…" value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 pr-4 h-9 w-60 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <span className="text-[12px] text-slate-400 font-semibold">
                {className}{secName ? ` · Sec ${secName}` : ''} · {TERMS.find(t => t.value === term)?.label} · {academicYear}
                <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px]">{filtered.length} students</span>
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap w-[88px]">
                      Roll No
                    </th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap min-w-[180px]">
                      Student Name
                    </th>
                    {coSubjects.map((sub, i) => (
                      <th key={sub.subject_id}
                        className={[
                          'text-center px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap min-w-[100px]',
                          i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900',
                        ].join(' ')}>
                        {sub.subject_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coSubjects.length === 0 ? (
                    <tr><td colSpan={2} className="px-5 py-14 text-center text-slate-400 text-sm">
                      No co-scholastic subjects found. Add subjects with <strong>assessment_model = co_scholastic</strong>.
                    </td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={2 + coSubjects.length} className="px-5 py-14 text-center text-slate-400 text-sm">
                      No students found.
                    </td></tr>
                  ) : paginated.map((student, idx) => (
                    <tr key={student.student_id}
                      className={[
                        'border-b border-slate-100 hover:bg-indigo-50/40 transition-colors',
                        idx % 2 !== 0 ? 'bg-slate-50/60' : 'bg-white',
                      ].join(' ')}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {student.roll_no ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 shadow-sm">
                            {student.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 text-[13px]">{student.name}</span>
                        </div>
                      </td>
                      {coSubjects.map(sub => {
                        const key = `${student.student_id}_${sub.subject_id}`
                        return (
                          <td key={sub.subject_id} className="px-4 py-3.5 text-center">
                            <GradeSelect
                              value={localGrades[key]}
                              onChange={g => handleGradeChange(student.student_id, sub.subject_id, g)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-white">
              <span className="text-[12px] text-slate-400">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-[12px] font-semibold text-slate-600 px-2">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loaded && !loading && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Select filters and click <strong className="text-slate-600">Load</strong> to view grades</p>
          </div>
        )}

      </div>

      {/* ── Bottom bar ── */}
      {loaded && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 px-6 py-3.5 z-40
          flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.07)] transition-[left] duration-300">
          <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AUTO-SAVING ENABLED
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={handleReset} disabled={!dirty || saving}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
              <RotateCcw className="w-3.5 h-3.5" />Reset Changes
            </button>
            <button onClick={handleSave} disabled={!dirty || saving}
              className="flex items-center gap-2 px-5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-[13px] font-bold rounded-xl transition shadow-sm shadow-indigo-200">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save All Grades</>}
            </button>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  )
}