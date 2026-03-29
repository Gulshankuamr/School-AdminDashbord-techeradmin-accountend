import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Bus, User, MapPin, BookOpen, Calendar, CalendarCheck,
  Plus, RotateCcw, Search, Edit2, Trash2, X,
  ChevronDown, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, Loader2, Navigation2, Phone, Truck,
  DollarSign, Clock, BadgeCheck, AlertCircle,
  Filter, GraduationCap, Layers, Hash, Ban, List, ChevronUp
} from 'lucide-react'
import { studentTransportService } from '../../services/transportService/studentTransportService'
import AssignedTransportList from './Assignedtransportlist'

// ─── Constants ─────────────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 8
const CURRENT_YEAR  = new Date().getFullYear()
const DEFAULT_AY    = `${CURRENT_YEAR}-${String(CURRENT_YEAR + 1).slice(2)}`

// ─── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white min-w-[280px] animate-slide-in
            ${t.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {t.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 ml-1"><X size={14} /></button>
        </div>
      ))}
    </div>
  )
}

// ─── Discontinue Modal ──────────────────────────────────────────────────────────
function DiscontinueModal({ item, onConfirm, onCancel, loading }) {
  const today = new Date().toISOString().split('T')[0]
  const [discontinuedOn, setDiscontinuedOn] = useState(today)
  const [reason, setReason]                 = useState('')
  const [errors, setErrors]                 = useState({})

  const validate = () => {
    const errs = {}
    if (!discontinuedOn) errs.discontinuedOn = 'Date is required'
    if (!reason.trim())  errs.reason          = 'Reason is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onConfirm({ discontinued_on: discontinuedOn, discontinue_reason: reason.trim() })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-pop-in">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Ban size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Discontinue Transport</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Student: <span className="font-semibold text-gray-700">{item?.student_name}</span>
            </p>
          </div>
          <button onClick={onCancel} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Info strip */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Transport assignment will be <span className="font-bold">discontinued</span>, not deleted.
            History will be preserved for records.
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 mb-6">

          {/* Academic Year — read-only from row */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Academic Year
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
              <BookOpen size={14} className="text-gray-400" />
              {item?.academic_year || DEFAULT_AY}
            </div>
          </div>

          {/* Discontinued On */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Discontinued On <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={discontinuedOn}
                onChange={e => { setDiscontinuedOn(e.target.value); setErrors(x => ({ ...x, discontinuedOn: '' })) }}
                className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all
                  ${errors.discontinuedOn ? 'border-red-400' : 'border-gray-200'}`}
              />
            </div>
            {errors.discontinuedOn && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertTriangle size={10} />{errors.discontinuedOn}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Discontinue Reason <span className="text-orange-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors(x => ({ ...x, reason: '' })) }}
              placeholder="e.g. Student left school, Shifted to another area..."
              rows={3}
              className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none
                focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all
                ${errors.reason ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.reason && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertTriangle size={10} />{errors.reason}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <Ban size={14} />
            }
            Confirm Discontinue
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Simple Native Select Dropdown ─────────────────────────────────────────────
function SelectField({ value, onChange, disabled, loading, placeholder, children, icon: Icon }) {
  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />}
      {loading && <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin pointer-events-none z-10" />}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`appearance-none w-full ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
          text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all
          disabled:cursor-not-allowed`}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ─── Student Dropdown with search ──────────────────────────────────────────────
function StudentDropdown({ students, value, onChange, disabled, loading }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { if (!open) setQuery('') }, [open])

  const filtered = students.filter(s => {
    const q = query.toLowerCase()
    return (
      (s.name || s.student_name || '').toLowerCase().includes(q) ||
      (s.roll_number || '').toLowerCase().includes(q) ||
      (s.admission_no || '').toLowerCase().includes(q)
    )
  })

  const selected = students.find(s => String(s.student_id) === String(value))
  const displayLabel = selected
    ? `${selected.name || selected.student_name}${selected.roll_number ? ` — ${selected.roll_number}` : ''}`
    : 'Select Student'

  return (
    <div ref={ref} className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button type="button" onClick={() => !disabled && setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all text-left
          ${open ? 'border-orange-400 ring-2 ring-orange-400/20' : 'border-gray-200 hover:border-gray-300'}
          ${!selected ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
        {loading
          ? <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin" />
          : <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        }
        <span className="truncate flex-1">{loading ? 'Loading students...' : displayLabel}</span>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !loading && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-30 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or roll no..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">No students found</div>
            ) : filtered.map(s => (
              <button key={s.student_id} type="button"
                onClick={() => { onChange(String(s.student_id)); setOpen(false) }}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b border-gray-50 last:border-0
                  ${String(s.student_id) === String(value) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                <div className={`text-sm font-semibold ${String(s.student_id) === String(value) ? 'text-orange-700' : 'text-gray-800'}`}>
                  {s.name || s.student_name}
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                  {s.roll_number && <span className="flex items-center gap-1"><Hash size={9} />Roll: {s.roll_number}</span>}
                  {s.admission_no && <span>Adm: {s.admission_no}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Field Wrapper ──────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertTriangle size={10} />{error}
        </p>
      )}
    </div>
  )
}

// ─── Fee Status Badge ───────────────────────────────────────────────────────────
function FeeStatusBadge({ status }) {
  const map = {
    paid:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <BadgeCheck size={11} /> },
    partial: { cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: <Clock size={11} /> },
    pending: { cls: 'bg-red-50 text-red-600 border-red-200',             icon: <AlertCircle size={11} /> },
  }
  const s   = status?.toLowerCase() || 'pending'
  const cfg = map[s] || map.pending
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold uppercase tracking-wide ${cfg.cls}`}>
      {cfg.icon}{status || 'Pending'}
    </span>
  )
}

// ─── Info Item (preview card) ───────────────────────────────────────────────────
function InfoItem({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${accent || 'text-gray-800'}`}>{value || '—'}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════
export default function AssignStudentTransport() {

  // ── Data ──
  const [classes,   setClasses]   = useState([])
  const [sections,  setSections]  = useState([])
  const [students,  setStudents]  = useState([])
  const [routes,    setRoutes]    = useState([])
  const [stops,     setStops]     = useState([])
  const [assignments, setAssignments] = useState([])
  const [preview,   setPreview]   = useState(null)

  // ── Loading ──
  const [classesLoading,  setClassesLoading]  = useState(true)
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [routesLoading,   setRoutesLoading]   = useState(true)
  const [stopsLoading,    setStopsLoading]    = useState(false)
  const [submitLoading,   setSubmitLoading]   = useState(false)
  const [discontinueLoading, setDiscontinueLoading] = useState(false)
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)

  // ── Form ──
  const [form, setForm] = useState({
    class_id: '', section_id: '', student_id: '',
    transport_route_id: '', transport_route_stop_id: '',
    academic_year: DEFAULT_AY, academic_year_end: '', assigned_on: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // ── Table ──
  const [search,            setSearch]            = useState('')
  const [page,              setPage]              = useState(1)
  const [discontinueTarget, setDiscontinueTarget] = useState(null)  // replaces deleteTarget
  const [toasts,            setToasts]            = useState([])
  const [showList,          setShowList]          = useState(false)  // toggle AssignedTransportList

  // ── List filter states ──
  const [listYear,    setListYear]    = useState(DEFAULT_AY)
  const [listClass,   setListClass]   = useState('all')
  const [listSection, setListSection] = useState('all')
  const [listData,    setListData]    = useState([])
  const [listLoading, setListLoading] = useState(false)

  // ── Toast helpers ──
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  const removeToast = id => setToasts(t => t.filter(x => x.id !== id))

  // ── Load classes on mount ──
  useEffect(() => {
    ;(async () => {
      try {
        setClassesLoading(true)
        const data = await studentTransportService.getClasses()
        setClasses(data)
      } catch (err) {
        addToast('Failed to load classes', 'error')
      } finally {
        setClassesLoading(false)
      }
    })()
  }, [addToast])

  // ── Load routes on mount ──
  useEffect(() => {
    ;(async () => {
      try {
        setRoutesLoading(true)
        const data = await studentTransportService.getRoutes()
        setRoutes(data)
      } catch (err) {
        addToast('Failed to load routes', 'error')
      } finally {
        setRoutesLoading(false)
      }
    })()
  }, [addToast])

  // ── Load all assignments on mount ──
  useEffect(() => {
    ;(async () => {
      try {
        setAssignmentsLoading(true)
        const data = await studentTransportService.getAllAssignments()
        setAssignments(data)
      } catch { /* silently fail */ } finally {
        setAssignmentsLoading(false)
      }
    })()
  }, [])

  // ── Class → Sections ──
  const handleClassChange = async (classId) => {
    setForm(f => ({ ...f, class_id: classId, section_id: '', student_id: '' }))
    setSections([]); setStudents([]); setPreview(null)
    if (!classId) return
    try {
      setSectionsLoading(true)
      const data = await studentTransportService.getSections(classId)
      setSections(data)
    } catch { addToast('Failed to load sections', 'error') }
    finally { setSectionsLoading(false) }
  }

  // ── Section → Students ──
  const handleSectionChange = async (sectionId) => {
    setForm(f => ({ ...f, section_id: sectionId, student_id: '' }))
    setStudents([]); setPreview(null)
    if (!sectionId || !form.class_id) return
    try {
      setStudentsLoading(true)
      const data = await studentTransportService.getStudents(form.class_id, sectionId)
      setStudents(data)
    } catch { addToast('Failed to load students', 'error') }
    finally { setStudentsLoading(false) }
  }

  // ── Student → Preview ──
  const handleStudentChange = async (studentId) => {
    setForm(f => ({ ...f, student_id: studentId }))
    setPreview(null)
    if (!studentId) return
    try {
      const data = await studentTransportService.getStudentTransport(studentId, form.academic_year || DEFAULT_AY)
      if (data) setPreview(data)
    } catch { /* no previous transport */ }
  }

  // ── Route → Stops ──
  const handleRouteChange = async (routeId) => {
    setForm(f => ({ ...f, transport_route_id: routeId, transport_route_stop_id: '' }))
    setStops([])
    if (!routeId) return
    try {
      setStopsLoading(true)
      const data = await studentTransportService.getStopsByRoute(routeId)
      setStops(data)
    } catch { addToast('Failed to load stops', 'error') }
    finally { setStopsLoading(false) }
  }

  // ── Validate ──
  const validate = () => {
    const errs = {}
    if (!form.class_id)                  errs.class_id                = 'Select a class'
    if (!form.section_id)                errs.section_id              = 'Select a section'
    if (!form.student_id)                errs.student_id              = 'Select a student'
    if (!form.transport_route_id)        errs.transport_route_id      = 'Select a route'
    if (!form.transport_route_stop_id)   errs.transport_route_stop_id = 'Select a stop'
    if (!form.academic_year.trim())      errs.academic_year           = 'Required'
    if (!form.academic_year_end)         errs.academic_year_end       = 'Required'
    if (!form.assigned_on)               errs.assigned_on             = 'Required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setSubmitLoading(true)
      const res = await studentTransportService.assignTransport({
        student_id:              Number(form.student_id),
        transport_route_id:      Number(form.transport_route_id),
        transport_route_stop_id: Number(form.transport_route_stop_id),
        academic_year:           form.academic_year,
        academic_year_end:       form.academic_year_end,
        assigned_on:             form.assigned_on,
      })
      addToast('Transport assigned successfully!')

      const student  = students.find(s => String(s.student_id) === form.student_id)
      const cls      = classes.find(c => String(c.class_id) === form.class_id)
      const sec      = sections.find(s => String(s.section_id) === form.section_id)
      const route    = routes.find(r => String(r.transport_route_id) === form.transport_route_id)
      const stop     = stops.find(s => String(s.transport_route_stop_id) === form.transport_route_stop_id)

      const newRow = {
        id:            res?.data?.id ?? Date.now(),
        student_id:    Number(form.student_id),
        student_name:  student?.name || student?.student_name || '—',
        roll_number:   student?.roll_number || '',
        class_name:    cls?.class_name || '—',
        section_name:  sec?.section_name || '—',
        route_name:    route?.route_name || '—',
        stop_name:     stop?.stop_name   || '—',
        vehicle_no:    route?.vehicle_no  || '—',
        driver_name:   route?.driver_name || '—',
        academic_year: form.academic_year,
        assigned_on:   form.assigned_on,
        fee_status:    'Pending',
      }
      setAssignments(prev => [newRow, ...prev])
      handleReset()
    } catch (err) {
      addToast(err.message || 'Failed to assign transport', 'error')
    } finally {
      setSubmitLoading(false)
    }
  }

  // ── Reset ──
  const handleReset = () => {
    setForm({
      class_id: '', section_id: '', student_id: '',
      transport_route_id: '', transport_route_stop_id: '',
      academic_year: DEFAULT_AY, academic_year_end: '', assigned_on: ''
    })
    setFormErrors({})
    setSections([]); setStudents([]); setStops([]); setPreview(null)
  }

  // ── Discontinue ──
  const handleDiscontinue = async ({ discontinued_on, discontinue_reason }) => {
    try {
      setDiscontinueLoading(true)
      await studentTransportService.discontinueStudentTransport({
        student_id:         discontinueTarget.student_id,
        academic_year:      discontinueTarget.academic_year,
        discontinued_on,
        discontinue_reason,
      })
      // Mark row as discontinued in the table (optimistic)
      setAssignments(prev =>
        prev.map(a =>
          a.id === discontinueTarget.id
            ? { ...a, fee_status: 'Discontinued', _discontinued: true }
            : a
        )
      )
      setDiscontinueTarget(null)
      addToast('Transport discontinued successfully')
    } catch (err) {
      addToast(err.message || 'Failed to discontinue transport', 'error')
    } finally {
      setDiscontinueLoading(false)
    }
  }

  // ── Filtered + paginated ──
  const filtered   = assignments.filter(a =>
    [a.student_name, a.route_name, a.stop_name, a.class_name, a.section_name, a.academic_year, a.fee_status, a.roll_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
  useEffect(() => setPage(1), [search])

  // ── Helpers ──

  // ── Fetch list data when year changes or showList opens ──
  useEffect(() => {
    if (!showList || !listYear) return
    ;(async () => {
      try {
        setListLoading(true)
        setListClass('all')
        setListSection('all')
        const data = await studentTransportService.getTransportStudentsByYear(listYear)
        setListData(data)
      } catch { setListData([]) }
      finally { setListLoading(false) }
    })()
  }, [listYear, showList])

  // ── List filter computed values ──
  const listUniqueClasses = [...new Map(
    listData
      .filter(a => a.class_name)
      .map(a => [a.class_name, { id: a.class_name, name: a.class_name }])
  ).values()].sort((a, b) => a.name.localeCompare(b.name))

  const listUniqueSections = [...new Map(
    listData
      .filter(a => a.section_name &&
        (listClass === 'all' || a.class_name === listClass))
      .map(a => [a.section_name, { id: a.section_name, name: a.section_name }])
  ).values()].sort((a, b) => a.name.localeCompare(b.name))

  // generate year options: current year ± 3
  const listYearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = CURRENT_YEAR - 2 + i
    return `${y}-${String(y + 1).slice(2)}`
  }).reverse()

  const listFiltered = listData.filter(a => {
    const matchClass   = listClass   === 'all' || a.class_name   === listClass
    const matchSection = listSection === 'all' || a.section_name === listSection
    return matchClass && matchSection
  })


  const err  = (key) => formErrors[key]
  const setF = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setFormErrors(x => ({ ...x, [key]: '' }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .asgn { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes slide-in { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pop-in   { from{opacity:0;transform:scale(.93)}       to{opacity:1;transform:scale(1)} }
        @keyframes fade-up  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-slide-in{ animation:slide-in .25s ease both }
        .animate-pop-in  { animation:pop-in .2s ease both }
        .animate-fade-up { animation:fade-up .3s ease both }
        .row-in          { animation:fade-up .2s ease both }
        input[type="date"]::-webkit-calendar-picker-indicator{ opacity:.5;cursor:pointer }
      `}</style>

      <div className="asgn min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 p-4 sm:p-6 lg:p-8">
        <Toast toasts={toasts} remove={removeToast} />

        {/* ── Discontinue Modal ── */}
        {discontinueTarget && (
          <DiscontinueModal
            item={discontinueTarget}
            onConfirm={handleDiscontinue}
            onCancel={() => setDiscontinueTarget(null)}
            loading={discontinueLoading}
          />
        )}

        {/* ── Page Header ── */}
        <div className="mb-7">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 font-medium">
            <Bus size={12} className="text-orange-400" />
            <span>Transport</span>
            <ChevronDown size={11} className="-rotate-90 text-gray-300" />
            <span className="text-orange-500 font-semibold">Assign Student</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
              <Navigation2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Student Routes</h1>
              <p className="text-sm text-gray-500 mt-0.5">Assign bus routes, stops and track transport fees for individual students</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SECTION 1 — FORM
        ══════════════════════════════════════ */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 animate-fade-up">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Bus size={15} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Transport Assignment Form</h2>
                <p className="text-xs text-gray-400">Fill all fields to assign transport to a student</p>
              </div>
            </div>

            {/* Row 1: Class, Section, Student, Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Field label="Class" required error={err('class_id')}>
                <SelectField
                  value={form.class_id} onChange={handleClassChange}
                  loading={classesLoading} placeholder="Select Class" icon={GraduationCap}>
                  {classes.map(c => (
                    <option key={c.class_id} value={String(c.class_id)}>{c.class_name}</option>
                  ))}
                </SelectField>
              </Field>

              <Field label="Section" required error={err('section_id')}>
                <SelectField
                  value={form.section_id} onChange={handleSectionChange}
                  loading={sectionsLoading} disabled={!form.class_id}
                  placeholder={!form.class_id ? 'Select class first' : 'Select Section'} icon={Layers}>
                  {sections.map(s => (
                    <option key={s.section_id} value={String(s.section_id)}>
                      {s.display_name || s.section_name}
                    </option>
                  ))}
                </SelectField>
              </Field>

              <Field label="Student" required error={err('student_id')}>
                <StudentDropdown
                  students={students}
                  value={form.student_id}
                  onChange={handleStudentChange}
                  disabled={!form.section_id}
                  loading={studentsLoading}
                />
              </Field>

              <Field label="Route" required error={err('transport_route_id')}>
                <SelectField
                  value={form.transport_route_id} onChange={handleRouteChange}
                  loading={routesLoading} placeholder="Select Route" icon={Bus}>
                  {routes.map(r => (
                    <option key={r.transport_route_id} value={String(r.transport_route_id)}>{r.route_name}</option>
                  ))}
                </SelectField>
              </Field>
            </div>

            {/* Row 2: Stop, Academic Year, Year End, Assigned On */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <Field label="Stop" required error={err('transport_route_stop_id')}>
                <SelectField
                  value={form.transport_route_stop_id}
                  onChange={v => setF('transport_route_stop_id', v)}
                  loading={stopsLoading}
                  disabled={!form.transport_route_id}
                  placeholder={!form.transport_route_id ? 'Select route first' : 'Select Stop'} icon={MapPin}>
                  {stops.map(s => (
                    <option key={s.transport_route_stop_id} value={String(s.transport_route_stop_id)}>
                      {s.stop_name}{s.distance_km ? ` (${s.distance_km} km)` : ''}
                    </option>
                  ))}
                </SelectField>
              </Field>

              <Field label="Academic Year" required error={err('academic_year')}>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    placeholder="e.g. 2026-27" value={form.academic_year}
                    onChange={e => setF('academic_year', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                  />
                </div>
              </Field>

              <Field label="Academic Year End" required error={err('academic_year_end')}>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="date" value={form.academic_year_end}
                    onChange={e => setF('academic_year_end', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                  />
                </div>
              </Field>

              <Field label="Assigned On" required error={err('assigned_on')}>
                <div className="relative">
                  <CalendarCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="date" value={form.assigned_on}
                    onChange={e => setF('assigned_on', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                  />
                </div>
              </Field>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                <span className="text-orange-500">*</span> All fields marked with asterisk are required
              </p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl transition-colors">
                  <RotateCcw size={14} /> Reset Form
                </button>
                <button type="submit" disabled={submitLoading}
                  className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                    text-white text-sm font-bold rounded-xl shadow-md shadow-orange-200 transition-all active:scale-95 disabled:opacity-60">
                  {submitLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Assign Transport
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* ══════════════════════════════════════
            SECTION 2 — PREVIEW CARD
        ══════════════════════════════════════ */}
        {preview && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck size={15} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Student Transport Details Preview</h2>
                  <p className="text-xs text-gray-400">Current assignment for selected student</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                AUTO GENERATED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 pb-5 border-b border-dashed border-gray-200 mb-5">
              <InfoItem label="Route Name"     value={preview.route_name} />
              <InfoItem label="Stop Name"      value={preview.stop_name} />
              <InfoItem label="Vehicle Number" value={preview.vehicle_no} />
              <InfoItem label="Driver Name"    value={preview.driver_name} />
              <InfoItem label="Driver Phone"   value={preview.driver_phone} accent="text-orange-600" />
              <InfoItem label="Distance (KM)"  value={preview.distance_km ? `${preview.distance_km} KM` : null} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              <InfoItem label="Base Amount"     value={preview.base_amount     ? `$${preview.base_amount} / Term` : null} />
              <InfoItem label="Assigned Amount" value={preview.assigned_amount ? `$${preview.assigned_amount}`   : null} />
              <InfoItem label="Paid Amount"     value={preview.paid_amount     ? `$${preview.paid_amount}`       : null} accent="text-emerald-600" />
              <InfoItem label="Pending Amount"  value={preview.pending_amount  ? `$${preview.pending_amount}`    : null} accent="text-red-500" />
              <InfoItem label="Fee Frequency"   value={preview.fee_frequency} />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee Status</span>
                <FeeStatusBadge status={preview.fee_status} />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            SECTION 3 — VIEW LIST TOGGLE
        ══════════════════════════════════════ */}

        {/* Toggle Bar + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 mb-3 animate-fade-up">
          {/* Row 1: title + toggle btn */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                <Filter size={14} className="text-slate-500" />
              </div>
              <h2 className="text-sm font-bold text-gray-700">Assigned Transport Records</h2>
              <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-md border border-orange-100">
                {listFiltered.length} / {listData.length}
              </span>
            </div>
            <button
              onClick={() => setShowList(v => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all
                ${showList
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                  : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'}`}>
              {showList
                ? <><ChevronUp size={15} /> Hide List</>
                : <><List size={15} /> View List</>
              }
            </button>
          </div>

          {/* Row 2: Year first → then Class → Section */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Academic Year — PRIMARY filter, triggers API */}
            <div className="relative">
              <BookOpen size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none z-10" />
              <select
                value={listYear}
                onChange={e => setListYear(e.target.value)}
                className="appearance-none pl-8 pr-9 py-2 bg-orange-50 border border-orange-300 rounded-xl
                  text-sm text-orange-700 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400/30
                  focus:border-orange-500 transition-all min-w-[145px]">
                {listYearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
            </div>

            {/* Class */}
            <div className={`relative transition-opacity ${listData.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
              <GraduationCap size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={listClass}
                onChange={e => { setListClass(e.target.value); setListSection('all') }}
                disabled={listData.length === 0}
                className="appearance-none pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl
                  text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400/30
                  focus:border-orange-400 transition-all min-w-[145px] disabled:cursor-not-allowed">
                <option value="all">All Classes</option>
                {listUniqueClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Section */}
            <div className={`relative transition-opacity ${listClass === 'all' ? 'opacity-40 pointer-events-none' : ''}`}>
              <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={listSection}
                onChange={e => setListSection(e.target.value)}
                disabled={listClass === 'all'}
                className="appearance-none pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl
                  text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400/30
                  focus:border-orange-400 transition-all min-w-[145px] disabled:cursor-not-allowed">
                <option value="all">All Sections</option>
                {listUniqueSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Loading spinner */}
            {listLoading && <Loader2 size={15} className="animate-spin text-orange-400" />}

            {/* Clear class/section */}
            {(listClass !== 'all' || listSection !== 'all') && (
              <button
                onClick={() => { setListClass('all'); setListSection('all') }}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200
                  text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-100 transition-colors">
                <X size={11} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible List */}
        {showList && (
          <div className="animate-fade-up">
            <AssignedTransportList
              assignments={listFiltered}
              loading={listLoading}
            />
          </div>
        )}

      </div>
    </>
  )
}