import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle, Search, ChevronLeft, ChevronRight,
  Loader2, GraduationCap, BookOpen,
  Pencil, Trash2, CheckCircle2, AlertCircle, X, Check, User,
} from 'lucide-react'
import { coScholasticGradeService } from '../../services/examService/coScholasticGradeService'
import { API_BASE_URL, getAuthToken } from '../../services/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D']

const GRADE_COLORS = {
  A1: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  A2: 'bg-teal-100 text-teal-800 border border-teal-200',
  B1: 'bg-blue-100 text-blue-800 border border-blue-200',
  B2: 'bg-violet-100 text-violet-800 border border-violet-200',
  C1: 'bg-amber-100 text-amber-800 border border-amber-200',
  C2: 'bg-orange-100 text-orange-800 border border-orange-200',
  D:  'bg-rose-100 text-rose-800 border border-rose-200',
}

// 2026-27 → 2032-33
const ACADEMIC_YEARS = Array.from({ length: 7 }, (_, i) => {
  const s = 2026 + i
  return `${s}-${String(s + 1).slice(2)}`
})

const PAGE_SIZE = 15

// ─── API helpers ─────────────────────────────────────────────────────────────

function authHdr() { return { Authorization: `Bearer ${getAuthToken()}` } }

async function apiGet(path) {
  const res  = await fetch(`${API_BASE_URL}${path}`, { headers: authHdr() })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message || `Failed: ${path}`)
  return json.data || []
}

// GET /schooladmin/getAllClasses → for class filter (to narrow student list)
const fetchClasses  = () => apiGet('/schooladmin/getAllClasses')

// GET /schooladmin/getAllSections?class_id=X
const fetchSections = (cid) => apiGet(`/schooladmin/getAllSections?class_id=${cid}`)

// GET /schooladmin/getTotalStudentsListBySchoolId?class_id=X&section_id=Y
// Returns: [{ student_id, name, roll_no, admission_no, ... }]
const fetchStudents = (cid, sid) =>
  apiGet(`/schooladmin/getTotalStudentsListBySchoolId?class_id=${cid}&section_id=${sid}`)

// ─── Sub-components ───────────────────────────────────────────────────────────

function GradeBadge({ grade }) {
  if (!grade) return <span className="text-slate-300 text-xs">—</span>
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${GRADE_COLORS[grade] || 'bg-slate-100 text-slate-600'}`}>
      {grade}
    </span>
  )
}

function InlineGradeSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      autoFocus
      className="h-8 pl-2 pr-6 rounded-lg border-2 border-indigo-400 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition appearance-none"
    >
      {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
    </select>
  )
}

function ConfirmModal({ row, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-6 animate-[modalIn_0.2s_ease]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[15px]">Delete Grade</h3>
            <p className="text-sm text-slate-500 mt-1">
              Delete <strong className="text-slate-700">{row?.grade}</strong> grade for{' '}
              <strong className="text-slate-700">{row?.student_name}</strong> in{' '}
              <strong className="text-slate-700">{row?.subject_name}</strong>?
            </p>
            <p className="text-xs text-rose-500 mt-2 font-semibold">This cannot be undone.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-6">
          <button onClick={onCancel} disabled={loading}
            className="px-4 h-9 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-4 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={[
          'flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-[toastIn_0.3s_ease]',
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

export default function CoScholasticGradesList() {
  const navigate = useNavigate()

  // ── Step 1 filters: Class + Section to narrow student list ────────────────
  const [academicYear,       setAcademicYear]       = useState(ACADEMIC_YEARS[0])
  const [classes,            setClasses]            = useState([])
  const [classesLoading,     setClassesLoading]     = useState(true)
  const [selectedClassId,    setSelectedClassId]    = useState('')
  const [sections,           setSections]           = useState([])
  const [sectionsLoading,    setSectionsLoading]    = useState(false)
  const [selectedSectionId,  setSelectedSectionId]  = useState('')

  // ── Step 2: Students from class+section ───────────────────────────────────
  const [students,        setStudents]        = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)   // { student_id, name, roll_no }

  // ── Step 3: Grades from API ───────────────────────────────────────────────
  // grades rows: { co_scholastic_grades_id, student_id, subject_id, term, grade,
  //               academic_year, subject_name, student_name, roll_no }
  const [grades,   setGrades]   = useState([])
  const [loading,  setLoading]  = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)

  // inline edit
  const [editingId,  setEditingId]  = useState(null)
  const [editGrade,  setEditGrade]  = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // delete
  const [deleteRow,     setDeleteRow]     = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // toast
  const [toasts, setToasts] = useState([])
  const tid = useRef(0)
  function toast(msg, type = 'success') {
    const id = ++tid.current
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }

  // ── Load classes ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchClasses()
      .then(d => { setClasses(d); if (d.length) setSelectedClassId(String(d[0].class_id)) })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setClassesLoading(false))
  }, [])

  // ── Load sections when class changes ──────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId) { setSections([]); setSelectedSectionId(''); return }
    setSectionsLoading(true); setSections([]); setSelectedSectionId('')
    setStudents([]); setSelectedStudent(null); setLoaded(false)

    fetchSections(selectedClassId)
      .then(d => { setSections(d); if (d.length) setSelectedSectionId(String(d[0].section_id)) })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setSectionsLoading(false))
  }, [selectedClassId])

  // ── Load students when section changes ────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId || !selectedSectionId) { setStudents([]); setSelectedStudent(null); return }
    setStudentsLoading(true); setStudents([]); setSelectedStudent(null); setLoaded(false)

    fetchStudents(selectedClassId, selectedSectionId)
      .then(d => {
        setStudents(d)
        if (d.length) setSelectedStudent(d[0])   // auto-select first student
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setStudentsLoading(false))
  }, [selectedClassId, selectedSectionId])

  // ── LOAD GRADES button ────────────────────────────────────────────────────
  // API: GET /getCoScholasticGrades?student_id=264&academic_year=2026-27
  async function handleLoad() {
    if (!selectedStudent) { toast('Please select a student', 'error'); return }
    setLoading(true); setLoaded(false); setEditingId(null)
    try {
      const res = await coScholasticGradeService.getCoScholasticGrades({
        student_id:    selectedStudent.student_id,
        academic_year: academicYear,
      })
      // res.data = [{ co_scholastic_grades_id, student_name, subject_name, term, grade, academic_year, roll_no, ... }]
      setGrades(res.data || [])
      setLoaded(true); setPage(1); setSearch('')
    } catch (e) {
      toast(e.message || 'Load failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Inline EDIT ───────────────────────────────────────────────────────────
  function startEdit(row) { setEditingId(row.co_scholastic_grades_id); setEditGrade(row.grade) }
  function cancelEdit()    { setEditingId(null); setEditGrade('') }

  async function confirmEdit(row) {
    if (editGrade === row.grade) { cancelEdit(); return }
    setEditSaving(true)
    try {
      await coScholasticGradeService.updateCoScholasticGrade(row.co_scholastic_grades_id, editGrade)
      setGrades(p => p.map(g =>
        g.co_scholastic_grades_id === row.co_scholastic_grades_id ? { ...g, grade: editGrade } : g
      ))
      cancelEdit(); toast('Grade updated!')
    } catch (e) { toast(e.message || 'Update failed', 'error') }
    finally     { setEditSaving(false) }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteRow) return
    setDeleteLoading(true)
    try {
      await coScholasticGradeService.deleteCoScholasticGrade(deleteRow.co_scholastic_grades_id)
      setGrades(p => p.filter(g => g.co_scholastic_grades_id !== deleteRow.co_scholastic_grades_id))
      setDeleteRow(null); toast('Grade deleted!')
    } catch (e) { toast(e.message || 'Delete failed', 'error') }
    finally     { setDeleteLoading(false) }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered   = grades.filter(g =>
    !search ||
    g.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.term?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const className  = classes.find(c  => String(c.class_id)   === selectedClassId)?.class_name    || ''
  const secName    = sections.find(s => String(s.section_id) === selectedSectionId)?.section_name || ''

  const canLoad = !!selectedStudent && !loading

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95)}      to{opacity:1;transform:none} }
      `}</style>

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          Academic Management
          <span className="text-slate-300 mx-0.5">›</span>
          <span className="text-indigo-500">Co-Scholastic Grades List</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
              Co-Scholastic Grades List
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Select a student to view, edit or delete their saved grades.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/exams/co-scholastic')}
            className="flex items-center gap-2 px-4 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition shadow-sm shadow-indigo-200"
          >
            <PlusCircle className="w-4 h-4" />
            Assign Grades
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Filter Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

          {/* Row 1: Academic Year + Class + Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">

            {/* Academic Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={e => { setAcademicYear(e.target.value); setLoaded(false) }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              >
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Class
              </label>
              {classesLoading ? (
                <div className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3 gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                  <option value="">— Select class —</option>
                  {classes.map(c => (
                    <option key={c.class_id} value={String(c.class_id)}>{c.class_name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Section
              </label>
              {sectionsLoading ? (
                <div className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3 gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                </div>
              ) : (
                <select
                  value={selectedSectionId}
                  onChange={e => setSelectedSectionId(e.target.value)}
                  disabled={!sections.length}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50"
                >
                  <option value="">— Select section —</option>
                  {sections.map(s => (
                    <option key={s.section_id} value={String(s.section_id)}>{s.section_name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-4" />

          {/* Row 2: Student dropdown + Load button */}
          <div className="flex gap-3 items-end">

            {/* Student */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Student
              </label>
              {studentsLoading ? (
                <div className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3 gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading students…
                </div>
              ) : (
                <select
                  value={selectedStudent?.student_id ?? ''}
                  onChange={e => {
                    const s = students.find(x => String(x.student_id) === e.target.value)
                    setSelectedStudent(s || null)
                    setLoaded(false)
                  }}
                  disabled={!students.length}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50"
                >
                  <option value="">— Select student —</option>
                  {students.map(s => (
                    <option key={s.student_id} value={String(s.student_id)}>
                      {s.name}{s.roll_no ? ` (Roll: ${s.roll_no})` : ''}{s.admission_no ? ` — ${s.admission_no}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Load button */}
            <button
              onClick={handleLoad}
              disabled={!canLoad}
              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                : <><BookOpen className="w-4 h-4" /> Load Grades</>}
            </button>
          </div>

          {/* Selected student info pill */}
          {selectedStudent && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500 font-medium">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-extrabold shrink-0">
                {selectedStudent.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span>
                <strong className="text-slate-700">{selectedStudent.name}</strong>
                {selectedStudent.roll_no && <> · Roll: <strong className="text-slate-700">{selectedStudent.roll_no}</strong></>}
                {' '}· {className}{secName ? ` / Sec ${secName}` : ''} · {academicYear}
              </span>
            </div>
          )}
        </div>

        {/* ── Grades Table ── */}
        {loaded && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeUp_0.35s_ease]">

            {/* Toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by subject or term…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 pr-4 h-9 w-56 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Student pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                  <User className="w-3 h-3 text-indigo-500" />
                  <span className="text-[12px] font-bold text-indigo-700">{selectedStudent?.name}</span>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">
                  {filtered.length} grade{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {[
                      { label: 'Roll No',      cls: 'text-left px-5 w-[90px] bg-slate-800' },
                      { label: 'Student Name', cls: 'text-left px-4 min-w-[160px] bg-slate-900' },
                      { label: 'Subject',      cls: 'text-left px-4 min-w-[130px] bg-slate-800' },
                      { label: 'Term',         cls: 'text-center px-4 bg-slate-900' },
                      { label: 'Grade',        cls: 'text-center px-4 bg-slate-800' },
                      { label: 'Acad. Year',   cls: 'text-center px-4 bg-slate-900' },
                      { label: 'Actions',      cls: 'text-center px-4 bg-slate-800' },
                    ].map(h => (
                      <th key={h.label} className={`py-3.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${h.cls}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-slate-400 text-sm">
                        No saved grade records found for <strong>{selectedStudent?.name}</strong> in {academicYear}.
                        <br />
                        <span className="text-xs mt-1 block">
                          Go to <strong>Assign Grades</strong> to create grades.
                        </span>
                      </td>
                    </tr>
                  ) : paginated.map((row, idx) => {
                    const isEditing = editingId === row.co_scholastic_grades_id
                    return (
                      <tr
                        key={row.co_scholastic_grades_id}
                        className={[
                          'border-b border-slate-100 hover:bg-indigo-50/30 transition-colors',
                          idx % 2 !== 0 ? 'bg-slate-50/50' : 'bg-white',
                        ].join(' ')}
                      >
                        {/* Roll No */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[12px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {row.roll_no ?? '—'}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 shadow-sm">
                              {row.student_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 text-[13px]">{row.student_name}</span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-700 text-[13px]">{row.subject_name}</span>
                        </td>

                        {/* Term */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 whitespace-nowrap">
                            {row.term === 'term1' ? 'Term 1' : row.term === 'term2' ? 'Term 2' : row.term}
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="px-4 py-3.5 text-center">
                          {isEditing
                            ? <InlineGradeSelect value={editGrade} onChange={setEditGrade} />
                            : <GradeBadge grade={row.grade} />
                          }
                        </td>

                        {/* Academic Year */}
                        <td className="px-4 py-3.5 text-center text-[12px] font-semibold text-slate-500">
                          {row.academic_year}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => confirmEdit(row)}
                                disabled={editSaving}
                                title="Save"
                                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition disabled:opacity-50"
                              >
                                {editSaving
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={editSaving}
                                title="Cancel"
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => startEdit(row)}
                                title="Edit grade"
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-500 hover:text-blue-600 flex items-center justify-center transition shadow-sm"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteRow(row)}
                                title="Delete grade"
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-[12px] text-slate-400">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
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

        {/* ── Empty / pre-load state ── */}
        {!loaded && !loading && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium text-center">
              Select a <strong className="text-slate-600">class → section → student</strong>
              <br />then click <strong className="text-slate-600">Load Grades</strong>
            </p>
          </div>
        )}

      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteRow && (
        <ConfirmModal
          row={deleteRow}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteRow(null)}
          loading={deleteLoading}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  )
}