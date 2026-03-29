import React, { useState, useEffect } from 'react'
import {
  Bus, MapPin, BookOpen, Search, X, ChevronLeft, ChevronRight,
  GraduationCap, Layers, Hash, Ban, Loader2, Phone, Truck,
  Calendar, ChevronDown, Eye, Navigation2, User2,
  AlertTriangle, CheckCircle, DollarSign, Activity,
  BadgeCheck, Clock, AlertCircle
} from 'lucide-react'
import { studentTransportService } from '../../services/transportService/studentTransportService'

const LIST_ROWS = 10

// ─── Discontinue Modal ──────────────────────────────────────────────────────────
function DiscontinueModal({ row, onConfirm, onCancel, loading }) {
  const today = new Date().toISOString().split('T')[0]
  const [discontinuedOn, setDiscontinuedOn] = useState(today)
  const [reason, setReason]                 = useState('')
  const [errors, setErrors]                 = useState({})

  const validate = () => {
    const errs = {}
    if (!discontinuedOn) errs.date   = 'Date is required'
    if (!reason.trim())  errs.reason = 'Reason is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'popIn .2s ease both' }}>

        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Ban size={18} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-800">Discontinue Transport</h3>
            <p className="text-xs text-gray-400 mt-0.5">{row?.student_name}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">Transport will be <strong>discontinued</strong>, history will be preserved.</p>
          </div>

          {/* Academic Year - readonly */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Academic Year</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
              <BookOpen size={13} className="text-gray-400" />{row?.academic_year || '—'}
            </div>
          </div>

          {/* Discontinued On */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Discontinued On <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="date" value={discontinuedOn}
                onChange={e => { setDiscontinuedOn(e.target.value); setErrors(x => ({ ...x, date: '' })) }}
                className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all
                  ${errors.date ? 'border-red-400' : 'border-gray-200'}`} />
            </div>
            {errors.date && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{errors.date}</p>}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Reason <span className="text-orange-500">*</span>
            </label>
            <textarea value={reason} rows={3}
              onChange={e => { setReason(e.target.value); setErrors(x => ({ ...x, reason: '' })) }}
              placeholder="e.g. Student left school, Route changed..."
              className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800
                placeholder-gray-400 resize-none focus:outline-none focus:ring-2
                focus:ring-amber-400/30 focus:border-amber-400 transition-all
                ${errors.reason ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.reason && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{errors.reason}</p>}
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (validate()) onConfirm({ discontinued_on: discontinuedOn, discontinue_reason: reason.trim() }) }}
            disabled={loading}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold
              transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Details Modal (fetches fresh API data) ─────────────────────────────────────
function DetailsModal({ row, onClose, onDiscontinue, onDiscontinueDone }) {
  const [data,    setData]    = useState(null)
  const [fetching, setFetching] = useState(true)
  const [showDisc, setShowDisc] = useState(false)
  const [discLoading, setDiscLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!row) return
    ;(async () => {
      try {
        setFetching(true)
        const res = await studentTransportService.getStudentTransport(
          row.student_id,
          row.academic_year
        )
        setData(res)
      } catch {
        setData(null)
      } finally {
        setFetching(false)
      }
    })()
  }, [row])

  const handleDiscontinue = async ({ discontinued_on, discontinue_reason }) => {
    try {
      setDiscLoading(true)
      await studentTransportService.discontinueStudentTransport({
        student_id:         row.student_id,
        academic_year:      row.academic_year,
        discontinued_on,
        discontinue_reason,
      })
      setShowDisc(false)
      setToast('Transport discontinued successfully')
      onDiscontinueDone(row)
      setTimeout(() => { setToast(null); onClose() }, 1800)
    } catch (err) {
      setToast('Error: ' + (err.message || 'Failed'))
      setTimeout(() => setToast(null), 3000)
    } finally {
      setDiscLoading(false)
    }
  }

  if (!row) return null

  const d = data
  const isDisc = d?.is_active === 0 || !!d?.discontinued_on

  const Row = ({ label, value, accent }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-[45%] shrink-0">{label}</span>
      <span className={`text-xs font-bold text-right flex-1 ${accent || 'text-gray-800'}`}>
        {value ?? '—'}
      </span>
    </div>
  )

  return (
    <>
      {showDisc && (
        <DiscontinueModal
          row={row}
          onConfirm={handleDiscontinue}
          onCancel={() => setShowDisc(false)}
          loading={discLoading}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          style={{ animation: 'popIn .2s ease both' }}>

          {/* Toast */}
          {toast && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg flex items-center gap-2
              ${toast.startsWith('Error') ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {toast.startsWith('Error') ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              {toast}
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck size={17} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Transport Details</h3>
                <p className="text-[11px] text-orange-100 mt-0.5">{row.student_name}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Discontinued banner */}
          {!fetching && isDisc && (
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center gap-2 shrink-0">
              <Ban size={12} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Transport Discontinued</span>
              {d?.discontinued_on && (
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(d.discontinued_on).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-5 py-4">
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={24} className="animate-spin text-orange-400" />
                <p className="text-xs text-gray-400">Fetching transport details...</p>
              </div>
            ) : !d ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <AlertCircle size={24} className="text-gray-300" />
                <p className="text-sm text-gray-400 font-medium">No transport data found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">

                {/* Student */}
                <Section title="Student" icon={User2} color="orange">
                  <Row label="Student Name"   value={d.student_name} />
                  <Row label="Admission No"   value={d.admission_no} />
                  <Row label="Academic Year"  value={d.academic_year} />
                  <Row label="Assigned On"    value={d.assigned_on ? new Date(d.assigned_on).toLocaleDateString() : null} />
                </Section>

                {/* Route & Stop */}
                <Section title="Route & Stop" icon={Navigation2} color="blue">
                  <Row label="Route Name"    value={d.route_name} />
                  <Row label="Stop Name"     value={d.stop_name} />
                  <Row label="Distance"      value={d.distance_km ? `${d.distance_km} km` : null} />
                  <Row label="Fee Frequency" value={d.fee_frequency} />
                </Section>

                {/* Vehicle & Driver */}
                <Section title="Vehicle & Driver" icon={Bus} color="violet">
                  <Row label="Vehicle No"    value={d.vehicle_no} />
                  <Row label="Driver Name"   value={d.driver_name} />
                  <Row label="Driver Phone"  value={d.driver_phone} accent="text-orange-600" />
                </Section>

                {/* Fee */}
                <Section title="Fee Details" icon={DollarSign} color="emerald">
                  <Row label="Base Amount"     value={d.base_amount     ? `₹${d.base_amount}`     : null} />
                  <Row label="Assigned Amount" value={d.assigned_amount ? `₹${d.assigned_amount}` : null} />
                  <Row label="Paid Amount"     value={d.paid_amount     ? `₹${d.paid_amount}`     : null} accent="text-emerald-600" />
                  <Row label="Pending Amount"  value={d.pending_amount  ? `₹${d.pending_amount}`  : null} accent="text-red-500" />
                  <Row label="Fee Status"      value={d.fee_status} accent={
                    d.fee_status === 'paid'    ? 'text-emerald-600' :
                    d.fee_status === 'partial' ? 'text-amber-600' : 'text-red-500'
                  } />
                </Section>

                {/* Discontinue info if already discontinued */}
                {isDisc && d.discontinue_reason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Discontinue Reason</p>
                    <p className="text-sm text-red-700 font-medium">{d.discontinue_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 shrink-0">
            {!fetching && !isDisc && (
              <button
                onClick={() => setShowDisc(true)}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-amber-50 hover:bg-amber-100
                  border border-amber-300 text-amber-600 text-sm font-bold rounded-xl transition-colors">
                <Ban size={14} /> Discontinue
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Section wrapper for Details modal ─────────────────────────────────────────
function Section({ title, icon: Icon, color, children }) {
  const colors = {
    orange:  'bg-orange-50/60 border-orange-100',
    blue:    'bg-blue-50/50   border-blue-100',
    violet:  'bg-violet-50/50 border-violet-100',
    emerald: 'bg-emerald-50/50 border-emerald-100',
  }
  const iconColors = {
    orange: 'text-orange-500', blue: 'text-blue-500',
    violet: 'text-violet-500', emerald: 'text-emerald-500',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color] || colors.orange}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${iconColors[color] || iconColors.orange}`}>
        <Icon size={10} />{title}
      </p>
      {children}
    </div>
  )
}

// ─── Skeleton Row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[30, 70, 55, 65, 60, 50, 70].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ── MAIN ────────────────────────────────────────────────────────────────────────
export default function AssignedTransportList({ assignments: propAssignments, loading: propLoading, onUpdate }) {
  const [localData,     setLocalData]     = useState([])
  const [localLoading,  setLocalLoading]  = useState(false)
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(1)
  const [filterClass,   setFilterClass]   = useState('all')
  const [filterSection, setFilterSection] = useState('all')
  const [detailRow,     setDetailRow]     = useState(null)
  // local overrides for discontinued rows (optimistic)
  const [discIds, setDiscIds] = useState(new Set())

  const rawAssignments = propAssignments ?? localData
  const loading        = propLoading     ?? localLoading

  // merge discontinued state into rows
  const assignments = rawAssignments.map(a =>
    discIds.has(a.student_transport_id ?? a.id)
      ? { ...a, _discontinued: true }
      : a
  )

  useEffect(() => {
    if (propAssignments) return
    ;(async () => {
      try {
        setLocalLoading(true)
        const data = await studentTransportService.getAllAssignments()
        setLocalData(data)
      } catch { /* silent */ }
      finally { setLocalLoading(false) }
    })()
  }, [propAssignments])

  // unique classes
  const uniqueClasses = [...new Map(
    assignments.filter(a => a.class_name)
      .map(a => [a.class_name, { id: a.class_name, name: a.class_name }])
  ).values()].sort((a, b) => a.name.localeCompare(b.name))

  // unique sections for selected class
  const uniqueSections = [...new Map(
    assignments
      .filter(a => a.section_name && (filterClass === 'all' || a.class_name === filterClass))
      .map(a => [a.section_name, { id: a.section_name, name: a.section_name }])
  ).values()].sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => { setFilterSection('all'); setPage(1) }, [filterClass])
  useEffect(() => { setPage(1) }, [search, filterSection])

  const filtered = assignments.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = [
      a.student_name, a.route_name, a.stop_name, a.class_name,
      a.section_name, a.academic_year, a.roll_number, a.roll_no,
      a.vehicle_no, a.driver_name, a.admission_no
    ].some(v => v?.toLowerCase().includes(q))
    const matchClass   = filterClass   === 'all' || a.class_name   === filterClass
    const matchSection = filterSection === 'all' || a.section_name === filterSection
    return matchSearch && matchClass && matchSection
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_ROWS))
  const paginated  = filtered.slice((page - 1) * LIST_ROWS, page * LIST_ROWS)
  const anyFilter  = filterClass !== 'all' || filterSection !== 'all' || search

  const handleDiscontinueDone = (row) => {
    const key = row.student_transport_id ?? row.id
    setDiscIds(prev => new Set([...prev, key]))
    onUpdate?.()
  }

  return (
    <>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>

      {detailRow && (
        <DetailsModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onDiscontinueDone={handleDiscontinueDone}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow shadow-orange-200">
                <Truck size={17} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-800 tracking-tight">All Assigned Students</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="font-bold text-orange-500">{filtered.length}</span>{' '}of{' '}
                  <span className="font-bold text-gray-600">{assignments.length}</span> assignments
                </p>
              </div>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search student, route, vehicle..."
                className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800
                  placeholder-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-orange-400/30
                  focus:border-orange-400 transition-all" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Class / Section filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Class */}
            <div className="relative">
              <GraduationCap size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl
                  text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400/30
                  focus:border-orange-400 transition-all min-w-[148px]">
                <option value="all">All Classes</option>
                {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Section */}
            <div className={`relative transition-opacity ${filterClass === 'all' ? 'opacity-40 pointer-events-none' : ''}`}>
              <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select value={filterSection}
                onChange={e => setFilterSection(e.target.value)}
                disabled={filterClass === 'all'}
                className="appearance-none pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl
                  text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400/30
                  focus:border-orange-400 transition-all min-w-[148px] disabled:cursor-not-allowed">
                <option value="all">All Sections</option>
                {uniqueSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {anyFilter && (
              <button
                onClick={() => { setFilterClass('all'); setFilterSection('all'); setSearch('') }}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200
                  text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-100 transition-colors">
                <X size={11} /> Clear Filters
              </button>
            )}
            {loading && <Loader2 size={15} className="animate-spin text-orange-400" />}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['#', 'Student', 'Class / Section', 'Route / Stop', 'Vehicle / Driver', 'Academic Year', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: LIST_ROWS }).map((_, i) => <SkeletonRow key={i} />)

              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Bus size={24} className="text-orange-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">
                      {search ? `No record found for "${search}"` : filterClass !== 'all' ? 'No assignment in this class' : 'No transport assignments yet'}
                    </p>
                    {anyFilter && (
                      <button onClick={() => { setFilterClass('all'); setFilterSection('all'); setSearch('') }}
                        className="mt-2 text-xs text-orange-500 hover:underline font-semibold">Clear filters</button>
                    )}
                  </td>
                </tr>

              ) : paginated.map((row, idx) => {
                const isDisc = row._discontinued || row.is_active === 0
                return (
                  <tr key={row.student_transport_id ?? row.id ?? idx}
                    className={`transition-colors ${isDisc ? 'opacity-55 bg-gray-50/40' : 'hover:bg-orange-50/20'}`}>

                    <td className="px-5 py-3.5 text-xs text-gray-400 font-bold">
                      {(page - 1) * LIST_ROWS + idx + 1}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0
                          ${isDisc ? 'bg-gray-400' : 'bg-gradient-to-br from-orange-400 to-orange-500'}`}>
                          {(row.student_name?.[0] || 'S').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm whitespace-nowrap">{row.student_name || '—'}</div>
                          {(row.roll_number || row.roll_no) && (
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Hash size={9} />Roll: {row.roll_number || row.roll_no}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100">
                        <GraduationCap size={9} />{row.class_name || '—'}
                      </span>
                      {row.section_name && (
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Layers size={9} />{row.section_name}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800 text-xs whitespace-nowrap">{row.route_name || '—'}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={9} />{row.stop_name || '—'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="text-xs font-semibold text-gray-700 flex items-center gap-1 whitespace-nowrap">
                        <Bus size={11} className="text-gray-400 shrink-0" />{row.vehicle_no || '—'}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">{row.driver_name || '—'}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-violet-50 text-violet-700 text-[11px] font-bold rounded-lg border border-violet-100">
                        <BookOpen size={9} />{row.academic_year || '—'}
                      </span>
                      <div className="text-[11px] text-gray-400 mt-1 whitespace-nowrap">
                        {row.assigned_on ? new Date(row.assigned_on).toLocaleDateString() : '—'}
                      </div>
                    </td>

                    {/* Actions: Details + Discontinue */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDetailRow(row)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100
                            border border-orange-200 text-orange-600 text-[11px] font-bold rounded-lg
                            transition-colors whitespace-nowrap">
                          <Eye size={11} /> Details
                        </button>

                        {!isDisc ? (
                          <button
                            onClick={() => setDetailRow(row)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100
                              border border-amber-200 text-amber-600 text-[11px] font-bold rounded-lg
                              transition-colors whitespace-nowrap">
                            <Ban size={11} /> Stop
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200
                            text-gray-400 text-[11px] font-bold rounded-lg whitespace-nowrap">
                            <Ban size={11} /> Stopped
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > LIST_ROWS && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-700">{(page - 1) * LIST_ROWS + 1}</span> to{' '}
              <span className="font-bold text-gray-700">{Math.min(page * LIST_ROWS, filtered.length)}</span> of{' '}
              <span className="font-bold text-gray-700">{filtered.length}</span> records
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white
                  text-gray-500 hover:border-orange-300 hover:text-orange-600 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i-1] > 1) acc.push('...'); acc.push(n); return acc }, [])
                .map((n, i) => n === '...'
                  ? <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                  : <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors
                        ${page === n ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'}`}>
                      {n}
                    </button>
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white
                  text-gray-500 hover:border-orange-300 hover:text-orange-600 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}