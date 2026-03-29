import React, { useState, useEffect, useCallback } from 'react'
import {
  Bus, Plus, Search, Edit2, Trash2, Save, X,
  Phone, User, Hash, MapPin, AlertTriangle,
  CheckCircle, Loader2, ChevronLeft, ChevronRight,
  MoreVertical, Navigation, Truck
} from 'lucide-react'
import { routeService } from '../../services/transportService/routeService'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white min-w-[260px] animate-slide-in
            ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {t.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ route, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-pop-in">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-1">Delete Route?</h3>
        <p className="text-sm text-center text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">"{route?.route_name}"</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Field Input ──────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all`}
        />
      </div>
    </div>
  )
}

// ─── Inline Edit Input ────────────────────────────────────────────────────────
function InlineInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2.5 py-1.5 bg-orange-50 border border-orange-300 rounded-lg text-sm text-gray-800 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-500 transition-all ${className}`}
    />
  )
}

const ROWS_PER_PAGE = 8

export default function RouteManagement() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [form, setForm] = useState({ route_name: '', vehicle_no: '', driver_name: '', driver_phone: '' })
  const [formErrors, setFormErrors] = useState({})

  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  const [deleteTarget, setDeleteTarget] = useState(null)

  const [toasts, setToasts] = useState([])

  // ── Toast helpers ──
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  const removeToast = id => setToasts(t => t.filter(x => x.id !== id))

  // ── Load routes ──
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await routeService.getRoutes()
      setRoutes(data)
    } catch (err) {
      addToast(err.message || 'Failed to load routes', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])

  // ── Filtered + paginated ──
  const filtered = routes.filter(r =>
    [r.route_name, r.vehicle_no, r.driver_name, r.driver_phone]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  useEffect(() => { setPage(1) }, [search])

  // ── Add route ──
  const validate = () => {
    const errs = {}
    if (!form.route_name.trim()) errs.route_name = 'Required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    try {
      setAddLoading(true)
      await routeService.createRoute({
        route_name: form.route_name.trim(),
        vehicle_no: form.vehicle_no.trim(),
        driver_name: form.driver_name.trim(),
        driver_phone: form.driver_phone.trim(),
      })
      setForm({ route_name: '', vehicle_no: '', driver_name: '', driver_phone: '' })
      await fetchRoutes()
      addToast('Route added successfully')
    } catch (err) {
      addToast(err.message || 'Failed to add route', 'error')
    } finally {
      setAddLoading(false)
    }
  }

  // ── Edit ──
  const startEdit = (route) => {
    setEditingId(route.transport_route_id)
    setEditData({
      route_name: route.route_name || '',
      vehicle_no: route.vehicle_no || '',
      driver_name: route.driver_name || '',
      driver_phone: route.driver_phone || '',
    })
  }
  const cancelEdit = () => { setEditingId(null); setEditData({}) }

  const handleSave = async (id) => {
    if (!editData.route_name?.trim()) {
      addToast('Route name is required', 'error'); return
    }
    try {
      setSaveLoading(true)
      await routeService.updateRoute({ transport_route_id: id, ...editData })
      await fetchRoutes()
      setEditingId(null)
      addToast('Route updated successfully')
    } catch (err) {
      addToast(err.message || 'Failed to update route', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Delete ──
  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await routeService.deleteRoute(deleteTarget.transport_route_id)
      await fetchRoutes()
      setDeleteTarget(null)
      addToast('Route deleted successfully')
    } catch (err) {
      addToast(err.message || 'Failed to delete route', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .route-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes slide-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pop-in   { from { opacity:0; transform:scale(.92) }        to { opacity:1; transform:scale(1) }   }
        @keyframes fade-up  { from { opacity:0; transform:translateY(10px) }  to { opacity:1; transform:translateY(0) } }
        .animate-slide-in { animation: slide-in .25s ease both }
        .animate-pop-in   { animation: pop-in   .2s  ease both }
        .animate-fade-up  { animation: fade-up  .3s  ease both }
        .row-enter { animation: fade-up .25s ease both }
      `}</style>

      <div className="route-root min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 p-4 sm:p-6 lg:p-8">
        <Toast toasts={toasts} remove={removeToast} />
        {deleteTarget && (
          <DeleteModal
            route={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Bus size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Transport Routes</h1>
              <p className="text-sm text-gray-500">Manage school bus routes &amp; fleet personnel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
            <Navigation size={14} className="text-orange-500" />
            <span><span className="font-bold text-gray-800">{routes.length}</span> routes total</span>
          </div>
        </div>

        {/* ── Add Route Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus size={15} className="text-orange-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Add New Route</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Field
                label="Route Name"
                icon={MapPin}
                required
                placeholder="e.g. North Sector A-1"
                value={form.route_name}
                onChange={e => { setForm(f => ({ ...f, route_name: e.target.value })); setFormErrors(x => ({ ...x, route_name: '' })) }}
              />
              {formErrors.route_name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} /> {formErrors.route_name}
                </p>
              )}
            </div>
            <Field
              label="Vehicle Number"
              icon={Hash}
              placeholder="e.g. BUS-8821"
              value={form.vehicle_no}
              onChange={e => setForm(f => ({ ...f, vehicle_no: e.target.value }))}
            />
            <Field
              label="Driver Name"
              icon={User}
              placeholder="e.g. Michael Smith"
              value={form.driver_name}
              onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))}
            />
            <Field
              label="Driver Phone"
              icon={Phone}
              placeholder="+1 (555) 000-0000"
              value={form.driver_phone}
              onChange={e => setForm(f => ({ ...f, driver_phone: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={addLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-200 hover:shadow-orange-300
                transition-all duration-200 active:scale-95 disabled:opacity-60"
            >
              {addLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add Route
            </button>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-up">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="relative max-w-xs w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search by route, vehicle or driver..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium shrink-0">
              Showing <span className="text-gray-700 font-bold">{filtered.length}</span> {filtered.length === 1 ? 'route' : 'routes'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Route Name</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Vehicle No.</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Driver</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={28} className="animate-spin text-orange-400" />
                        <p className="text-sm text-gray-400 font-medium">Loading routes...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Truck size={24} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">
                            {search ? 'No routes match your search' : 'No routes yet'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {search ? 'Try a different keyword' : 'Add your first transport route above'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((route, idx) => {
                    const isEditing = editingId === route.transport_route_id
                    return (
                      <tr
                        key={route.transport_route_id}
                        className={`row-enter group transition-colors ${isEditing ? 'bg-orange-50/60' : 'hover:bg-slate-50/70'}`}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        {/* Route Name */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <InlineInput
                              value={editData.route_name}
                              onChange={v => setEditData(d => ({ ...d, route_name: v }))}
                              placeholder="Route name"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin size={13} className="text-orange-500" />
                              </div>
                              <span className="font-semibold text-gray-800">{route.route_name}</span>
                            </div>
                          )}
                        </td>

                        {/* Vehicle */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <InlineInput
                              value={editData.vehicle_no}
                              onChange={v => setEditData(d => ({ ...d, vehicle_no: v }))}
                              placeholder="Vehicle no."
                            />
                          ) : (
                            route.vehicle_no ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                <Bus size={11} />{route.vehicle_no}
                              </span>
                            ) : <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Driver */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <InlineInput
                              value={editData.driver_name}
                              onChange={v => setEditData(d => ({ ...d, driver_name: v }))}
                              placeholder="Driver name"
                            />
                          ) : (
                            route.driver_name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                  {route.driver_name[0]?.toUpperCase()}
                                </div>
                                <span className="text-gray-700 font-medium">{route.driver_name}</span>
                              </div>
                            ) : <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <InlineInput
                              value={editData.driver_phone}
                              onChange={v => setEditData(d => ({ ...d, driver_phone: v }))}
                              placeholder="Phone number"
                            />
                          ) : (
                            route.driver_phone ? (
                              <span className="text-gray-600 font-medium">{route.driver_phone}</span>
                            ) : <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSave(route.transport_route_id)}
                                  disabled={saveLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg
                                    transition-colors shadow-sm disabled:opacity-60"
                                >
                                  {saveLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  <X size={12} /> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(route)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(route)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > ROWS_PER_PAGE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Page <span className="font-bold text-gray-700">{page}</span> of <span className="font-bold text-gray-700">{totalPages}</span>
                {' · '}<span className="text-gray-400">{filtered.length} results</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500
                    hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, i, arr) => {
                    if (i > 0 && n - arr[i - 1] > 1) acc.push('...')
                    acc.push(n)
                    return acc
                  }, [])
                  .map((n, i) =>
                    n === '...' ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors
                          ${page === n
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600'
                          }`}
                      >
                        {n}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500
                    hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
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