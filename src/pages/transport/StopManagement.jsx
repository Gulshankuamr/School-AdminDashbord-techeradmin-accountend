import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  MapPin, Plus, Search, Edit2, Trash2, Save, X,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle,
  Loader2, Bus, ChevronDown, Navigation2, IndianRupee ,
  Ruler, BookOpen
} from 'lucide-react'
import { routeService } from '../../services/transportService/routeService'
import { stopService } from '../../services/transportService/stopService'

const FEE_FREQUENCIES = ['monthly', 'quarterly', 'yearly']
const ROWS_PER_PAGE = 8

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white min-w-[270px] animate-slide-in
            ${t.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {t.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100"><X size={13} /></button>
        </div>
      ))}
    </div>
  )
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ stop, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-pop-in">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-center text-gray-800 mb-1">Delete Stop?</h3>
        <p className="text-sm text-center text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">"{stop?.stop_name}"</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FreqBadge ────────────────────────────────────────────────────────────────
function FreqBadge({ freq }) {
  const colors = {
    monthly:   'bg-blue-50 text-blue-600 border-blue-100',
    quarterly: 'bg-violet-50 text-violet-600 border-violet-100',
    yearly:    'bg-emerald-50 text-emerald-600 border-emerald-100',
  }
  const c = colors[freq?.toLowerCase()] || 'bg-gray-100 text-gray-500 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${c}`}>
      {freq || '—'}
    </span>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────
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

function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input {...props}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all`} />
    </div>
  )
}

function NativeSelect({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className="appearance-none w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all disabled:opacity-50 capitalize">
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

function InlineInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-2.5 py-1.5 bg-orange-50 border border-orange-300 rounded-lg text-sm text-gray-800 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-500 transition-all" />
  )
}

function InlineSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none w-full pl-2.5 pr-7 py-1.5 bg-orange-50 border border-orange-300 rounded-lg text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-500 transition-all capitalize">
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ─── Route Dropdown ───────────────────────────────────────────────────────────
function RouteDropdown({ routes, selected, onSelect, loading }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const label = selected
    ? `${selected.route_name} (Route ${String(selected.transport_route_id).padStart(2, '0')})`
    : 'Select a route...'

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm
          text-sm font-medium text-gray-800 hover:border-orange-300 transition-all">
        <div className="flex items-center gap-2 min-w-0">
          {loading
            ? <Loader2 size={14} className="animate-spin text-orange-400 shrink-0" />
            : <Bus size={14} className="text-orange-500 shrink-0" />}
          <span className="truncate">{loading ? 'Loading routes...' : label}</span>
        </div>
        <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !loading && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
          {routes.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No routes available</div>
          ) : routes.map(r => (
            <button key={r.transport_route_id} onClick={() => { onSelect(r); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors
                ${selected?.transport_route_id === r.transport_route_id
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0
                ${selected?.transport_route_id === r.transport_route_id
                  ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                {String(r.transport_route_id).padStart(2, '0')}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{r.route_name}</div>
                {r.vehicle_no && <div className="text-[11px] text-gray-400 truncate">{r.vehicle_no}</div>}
              </div>
              {selected?.transport_route_id === r.transport_route_id && (
                <CheckCircle size={14} className="ml-auto text-orange-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function StopManagement() {
  const [routes, setRoutes]               = useState([])
  const [routesLoading, setRoutesLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState(null)

  // ✅ allStops = cumulative list shown in table (never cleared on route change)
  const [allStops, setAllStops]           = useState([])
  const [stopsLoading, setStopsLoading]   = useState(false)

  const [feeHeads, setFeeHeads]               = useState([])
  const [feeHeadsLoading, setFeeHeadsLoading] = useState(true)

  const [form, setForm] = useState({
    stop_name: '', distance_km: '', base_amount: '', fee_frequency: 'monthly', fee_head_id: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [addLoading, setAddLoading] = useState(false)

  const [editingId, setEditingId]   = useState(null)
  const [editData, setEditData]     = useState({})
  const [saveLoading, setSaveLoading] = useState(false)

  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const [toasts, setToasts] = useState([])

  // ── Toast ──
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  const removeToast = id => setToasts(t => t.filter(x => x.id !== id))

  // ── Load routes ──
  useEffect(() => {
    ;(async () => {
      try {
        setRoutesLoading(true)
        const data = await routeService.getRoutes()
        setRoutes(data)
      } catch (err) {
        addToast(err.message || 'Failed to load routes', 'error')
      } finally {
        setRoutesLoading(false)
      }
    })()
  }, [addToast])

  // ── Load fee heads ──
  useEffect(() => {
    ;(async () => {
      try {
        setFeeHeadsLoading(true)
        const data = await stopService.getFeeHeads()
        setFeeHeads(data)
        if (data.length > 0) {
          setForm(f => ({ ...f, fee_head_id: String(data[0].fee_head_id) }))
        }
      } catch (err) {
        addToast(err.message || 'Failed to load fee heads', 'error')
      } finally {
        setFeeHeadsLoading(false)
      }
    })()
  }, [addToast])

  // ── Fetch stops for selected route and MERGE into allStops ──
  const fetchAndMergeStops = useCallback(async (routeId) => {
    try {
      setStopsLoading(true)
      const data = await stopService.getStops(routeId)
      // Merge: replace existing stops of this route, keep others
      setAllStops(prev => {
        const others = prev.filter(s => s.transport_route_id !== routeId)
        return [...others, ...data]
      })
    } catch (err) {
      addToast(err.message || 'Failed to load stops', 'error')
    } finally {
      setStopsLoading(false)
    }
  }, [addToast])

  // When route changes, load its stops (but keep table visible always)
  useEffect(() => {
    if (selectedRoute) {
      setEditingId(null)
      fetchAndMergeStops(selectedRoute.transport_route_id)
    }
  }, [selectedRoute, fetchAndMergeStops])

  // ── Filtered + paginated (always from allStops) ──
  const filtered = allStops.filter(s => {
    const q = search.toLowerCase()
    return (
      s.stop_name?.toLowerCase().includes(q) ||
      s.fee_frequency?.toLowerCase().includes(q) ||
      String(s.distance_km ?? '').includes(q) ||
      String(s.base_amount ?? '').includes(q)
    )
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
  useEffect(() => setPage(1), [search])

  // ── Validate ──
  const validate = () => {
    const errs = {}
    if (!form.stop_name.trim())                                      errs.stop_name   = 'Required'
    if (form.distance_km === '' || isNaN(Number(form.distance_km))) errs.distance_km = 'Enter valid distance'
    if (form.base_amount === '' || isNaN(Number(form.base_amount))) errs.base_amount = 'Enter valid amount'
    if (!form.fee_head_id)                                          errs.fee_head_id = 'Required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Add Stop ──
  const handleAdd = async () => {
    if (!selectedRoute) { addToast('Please select a route first', 'error'); return }
    if (!validate()) return
    try {
      setAddLoading(true)
      const res = await stopService.createStop({
        transport_route_id: selectedRoute.transport_route_id,
        stop_name:     form.stop_name.trim(),
        distance_km:   Number(form.distance_km),
        base_amount:   Number(form.base_amount),
        fee_frequency: form.fee_frequency,
        fee_head_id:   Number(form.fee_head_id),
      })

      // ✅ Immediately add to local list so user sees it instantly
      const newStop = {
        transport_route_stop_id: res?.data?.transport_route_stop_id ?? Date.now(),
        transport_route_id: selectedRoute.transport_route_id,
        stop_name:     form.stop_name.trim(),
        distance_km:   Number(form.distance_km),
        base_amount:   Number(form.base_amount),
        fee_frequency: form.fee_frequency,
      }
      setAllStops(prev => [...prev, newStop])

      // Reset form
      setForm({
        stop_name: '', distance_km: '', base_amount: '',
        fee_frequency: 'monthly',
        fee_head_id: feeHeads[0] ? String(feeHeads[0].fee_head_id) : ''
      })
      addToast('Stop added successfully')

      // Also refresh from server in background
      fetchAndMergeStops(selectedRoute.transport_route_id)
    } catch (err) {
      addToast(err.message || 'Failed to add stop', 'error')
    } finally {
      setAddLoading(false)
    }
  }

  // ── Edit ──
  const startEdit = (stop) => {
    setEditingId(stop.transport_route_stop_id)
    setEditData({
      stop_name:     stop.stop_name     || '',
      distance_km:   String(stop.distance_km  ?? ''),
      base_amount:   String(stop.base_amount  ?? ''),
      fee_frequency: stop.fee_frequency || 'monthly',
    })
  }
  const cancelEdit = () => { setEditingId(null); setEditData({}) }

  const handleSave = async (stop) => {
    if (!editData.stop_name?.trim()) { addToast('Stop name is required', 'error'); return }
    try {
      setSaveLoading(true)
      await stopService.updateStop({
        transport_route_stop_id: stop.transport_route_stop_id,
        stop_name:     editData.stop_name.trim(),
        distance_km:   Number(editData.distance_km),
        base_amount:   Number(editData.base_amount),
        fee_frequency: editData.fee_frequency,
      })
      // ✅ Update locally immediately
      setAllStops(prev => prev.map(s =>
        s.transport_route_stop_id === stop.transport_route_stop_id
          ? { ...s, ...editData, distance_km: Number(editData.distance_km), base_amount: Number(editData.base_amount) }
          : s
      ))
      setEditingId(null)
      addToast('Stop updated successfully')
    } catch (err) {
      addToast(err.message || 'Failed to update stop', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Delete ──
  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await stopService.deleteStop(deleteTarget.transport_route_stop_id)
      // ✅ Remove from local list immediately
      setAllStops(prev => prev.filter(s => s.transport_route_stop_id !== deleteTarget.transport_route_stop_id))
      setDeleteTarget(null)
      addToast('Stop deleted successfully')
    } catch (err) {
      addToast(err.message || 'Failed to delete stop', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .stop-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes slide-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pop-in   { from { opacity:0; transform:scale(.93) }        to { opacity:1; transform:scale(1) } }
        @keyframes fade-up  { from { opacity:0; transform:translateY(8px) }   to { opacity:1; transform:translateY(0) } }
        .animate-slide-in { animation: slide-in .25s ease both }
        .animate-pop-in   { animation: pop-in .2s ease both }
        .animate-fade-up  { animation: fade-up .3s ease both }
        .row-in           { animation: fade-up .22s ease both }
      `}</style>

      <div className="stop-root min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 p-4 sm:p-6 lg:p-8">
        <Toast toasts={toasts} remove={removeToast} />
        {deleteTarget && (
          <DeleteModal stop={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
        )}

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Navigation2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Transport Stops</h1>
              <p className="text-sm text-gray-500">Configure stops for each bus route</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">Select Route</span>
            <RouteDropdown routes={routes} selected={selectedRoute} onSelect={setSelectedRoute} loading={routesLoading} />
            {selectedRoute && (
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                Showing <span className="text-gray-700 font-bold">{allStops.filter(s => s.transport_route_id === selectedRoute.transport_route_id).length}</span> stops for this route
              </span>
            )}
          </div>
        </div>

        {/* ── Add Stop Card ── */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-up transition-opacity
          ${!selectedRoute ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus size={14} className="text-orange-600" />
            </div>
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Add New Transport Stop</h2>
            {!selectedRoute && (
              <span className="ml-auto text-[11px] text-orange-500 font-semibold flex items-center gap-1">
                <AlertTriangle size={11} /> Select a route first
              </span>
            )}
            {selectedRoute && (
              <span className="ml-auto text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                Adding to: {selectedRoute.route_name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Field label="Stop Name" required error={formErrors.stop_name}>
              <TextInput icon={MapPin} placeholder="e.g. Central Park Gate"
                value={form.stop_name}
                onChange={e => { setForm(f => ({ ...f, stop_name: e.target.value })); setFormErrors(x => ({ ...x, stop_name: '' })) }} />
            </Field>

            <Field label="Distance (KM)" required error={formErrors.distance_km}>
              <TextInput icon={Ruler} placeholder="0.0" type="number" min="0" step="0.1"
                value={form.distance_km}
                onChange={e => { setForm(f => ({ ...f, distance_km: e.target.value })); setFormErrors(x => ({ ...x, distance_km: '' })) }} />
            </Field>

            <Field label="Base Amount" required error={formErrors.base_amount}>
              <TextInput icon={IndianRupee } placeholder="0.00" type="number" min="0" step="0.01"
                value={form.base_amount}
                onChange={e => { setForm(f => ({ ...f, base_amount: e.target.value })); setFormErrors(x => ({ ...x, base_amount: '' })) }} />
            </Field>

            <Field label="Fee Frequency" required>
              <NativeSelect value={form.fee_frequency} onChange={v => setForm(f => ({ ...f, fee_frequency: v }))}>
                {FEE_FREQUENCIES.map(f => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Fee Head" required error={formErrors.fee_head_id}>
              {feeHeadsLoading ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400">
                  <Loader2 size={13} className="animate-spin text-orange-400" /> Loading...
                </div>
              ) : (
                <NativeSelect
                  value={form.fee_head_id}
                  onChange={v => { setForm(f => ({ ...f, fee_head_id: v })); setFormErrors(x => ({ ...x, fee_head_id: '' })) }}>
                  <option value="">Select fee head</option>
                  {feeHeads.map(fh => (
                    <option key={fh.fee_head_id} value={String(fh.fee_head_id)}>{fh.head_name}</option>
                  ))}
                </NativeSelect>
              )}
            </Field>
          </div>

          <div className="flex justify-end">
            <button onClick={handleAdd} disabled={addLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                text-white text-sm font-bold rounded-xl shadow-md shadow-orange-200 transition-all active:scale-95 disabled:opacity-60">
              {addLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add Stop
            </button>
          </div>
        </div>

        {/* ── Stops Table — ALWAYS VISIBLE ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                <BookOpen size={13} className="text-slate-500" />
              </div>
              <h2 className="text-sm font-bold text-gray-700">All Route Stops</h2>
              <span className="ml-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-md border border-orange-100">
                {allStops.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search by name, frequency..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 w-52
                    focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              {stopsLoading && <Loader2 size={15} className="animate-spin text-orange-400" />}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stop Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Distance (KM)</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Base Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Fee Frequency</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Empty state when no stops at all */}
                {allStops.length === 0 && !stopsLoading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                          <MapPin size={24} className="text-orange-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">No stops yet</p>
                        <p className="text-xs text-gray-400">
                          {selectedRoute ? 'Add your first stop using the form above' : 'Select a route and add stops'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Search empty state */}
                {allStops.length > 0 && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Search size={22} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">No stops match "{search}"</p>
                        <button onClick={() => setSearch('')} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                          Clear search
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {paginated.map((stop, idx) => {
                  const isEditing = editingId === stop.transport_route_stop_id
                  // Find route name for this stop
                  const routeForStop = routes.find(r => r.transport_route_id === stop.transport_route_id)

                  return (
                    <tr key={stop.transport_route_stop_id}
                      className={`row-in group transition-colors ${isEditing ? 'bg-orange-50/50' : 'hover:bg-slate-50/60'}`}
                      style={{ animationDelay: `${idx * 20}ms` }}>

                      {/* Stop Name */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <InlineInput value={editData.stop_name} onChange={v => setEditData(d => ({ ...d, stop_name: v }))} placeholder="Stop name" />
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center shrink-0">
                                <MapPin size={12} className="text-orange-500" />
                              </div>
                              <span className="font-semibold text-gray-800">{stop.stop_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 ml-8">
                              <p className="text-[11px] text-gray-400">
                                Stop ID: ST{String(stop.transport_route_stop_id).padStart(3, '0')}
                              </p>
                              {routeForStop && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                  {routeForStop.route_name}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Distance */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <InlineInput type="number" value={editData.distance_km}
                            onChange={v => setEditData(d => ({ ...d, distance_km: v }))} placeholder="0.0" />
                        ) : (
                          <span className="font-semibold text-gray-700">{stop.distance_km ?? '—'}</span>
                        )}
                      </td>

                      {/* Base Amount */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <InlineInput type="number" value={editData.base_amount}
                            onChange={v => setEditData(d => ({ ...d, base_amount: v }))} placeholder="0.00" />
                        ) : (
                          <span className="font-semibold text-gray-800">
                            {stop.base_amount != null ? `$${Number(stop.base_amount).toFixed(2)}` : '—'}
                          </span>
                        )}
                      </td>

                      {/* Fee Frequency */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <InlineSelect value={editData.fee_frequency} onChange={v => setEditData(d => ({ ...d, fee_frequency: v }))}>
                            {FEE_FREQUENCIES.map(f => (
                              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                            ))}
                          </InlineSelect>
                        ) : (
                          <FreqBadge freq={stop.fee_frequency} />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSave(stop)} disabled={saveLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
                                {saveLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                              </button>
                              <button onClick={cancelEdit}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition-colors">
                                <X size={12} /> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(stop)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(stop)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </>
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
          {filtered.length > ROWS_PER_PAGE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing <span className="font-bold text-gray-700">{(page - 1) * ROWS_PER_PAGE + 1}</span> to{' '}
                <span className="font-bold text-gray-700">{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span> of{' '}
                <span className="font-bold text-gray-700">{filtered.length}</span> stops
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500
                    hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, i, arr) => {
                    if (i > 0 && n - arr[i - 1] > 1) acc.push('...')
                    acc.push(n); return acc
                  }, [])
                  .map((n, i) =>
                    n === '...' ? (
                      <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                    ) : (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors
                          ${page === n
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'}`}>
                        {n}
                      </button>
                    )
                  )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500
                    hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}