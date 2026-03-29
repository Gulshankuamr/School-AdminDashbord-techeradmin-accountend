import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Pencil, Search, ChevronDown, Check, X, Plus, SlidersHorizontal, BookOpen, Users } from 'lucide-react'
import { sectionService } from '../../services/sectionService/sectionService'
import { toast } from 'sonner'

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirm({ section, onConfirm, onCancel, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Delete Section?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You're about to delete{' '}
            <span className="font-semibold text-slate-700">Section {section?.section_name}</span> from{' '}
            <span className="font-semibold text-slate-700">{section?.class_name}</span>. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-7">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition shadow-lg shadow-red-100 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                Deleting
              </>
            ) : (
              'Yes, Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Capacity Badge ────────────────────────────────────────────────────────────
function CapacityBadge({ value }) {
  const num = parseInt(value)
  const color  = num >= 40 ? '#0d9488' : num >= 20 ? '#0284c7' : '#94a3b8'
  const bg     = num >= 40 ? '#f0fdfa' : num >= 20 ? '#f0f9ff' : '#f8fafc'
  const border = num >= 40 ? '#99f6e4' : num >= 20 ? '#bae6fd' : '#e2e8f0'
  return (
    <span
      style={{
        background: bg, color, border: `1px solid ${border}`,
        borderRadius: 10, padding: '3px 13px',
        fontSize: 13, fontWeight: 600, display: 'inline-block', letterSpacing: 0.2,
      }}
    >
      {value ?? 0}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
function SectionList() {
  const navigate = useNavigate()
  const [sections, setSections]           = useState([])
  const [classes, setClasses]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [sortOrder, setSortOrder]         = useState('newest')
  const [showSortDropdown, setShowSortDropdown]   = useState(false)
  const [editingId, setEditingId]         = useState(null)
  const [editData, setEditData]           = useState({})
  const [saving, setSaving]               = useState(false)
  const [deleteSection, setDeleteSection] = useState(null)
  const [deleting, setDeleting]           = useState(false)

  const fetchClasses = async () => {
    try { const res = await sectionService.getAllClasses(); setClasses(res.data || []) }
    catch (err) { console.error(err) }
  }

  const fetchSections = async (classId) => {
    try {
      setLoading(true)
      const res = await sectionService.getAllSections(classId || undefined)
      setSections(res.data || [])
    } catch (err) { toast.error(err.message || 'Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClasses(); fetchSections() }, [])
  useEffect(() => {
    const h = () => { setShowClassDropdown(false); setShowSortDropdown(false) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  const startEdit  = (s) => { setEditingId(s.section_id); setEditData({ section_name: s.section_name, class_id: s.class_id, status: s.status, capacity: s.capacity ?? '' }) }
  const cancelEdit = () => { setEditingId(null); setEditData({}) }

  const saveEdit = async (s) => {
    if (!editData.section_name?.trim()) return toast.error('Section name required')
    if (!editData.capacity || parseInt(editData.capacity) <= 0) return toast.error('Valid capacity required')
    setSaving(true)
    try {
      await sectionService.updateSection({
        section_id: s.section_id,
        class_id: parseInt(editData.class_id),
        section_name: editData.section_name.trim().toUpperCase(),
        status: editData.status,
        capacity: parseInt(editData.capacity),
      })
      toast.success('Section updated!')
      setEditingId(null)
      await fetchSections(selectedClassId || undefined)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteSection) return
    setDeleting(true)
    try {
      await sectionService.deleteSection(deleteSection.section_id)
      toast.success('Section deleted')
      setDeleteSection(null)
      await fetchSections(selectedClassId || undefined)
    } catch (err) { toast.error(err.message) }
    finally { setDeleting(false) }
  }

  const handleClassFilter = (id) => {
    setSelectedClassId(id); setShowClassDropdown(false); fetchSections(id || undefined)
  }

  const filteredSections = sections
    .filter(s => {
      const q = search.toLowerCase()
      return s.section_name?.toLowerCase().includes(q) || s.class_name?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.section_id - a.section_id
      if (sortOrder === 'oldest') return a.section_id - b.section_id
      if (sortOrder === 'az')     return a.section_name?.localeCompare(b.section_name)
      if (sortOrder === 'za')     return b.section_name?.localeCompare(a.section_name)
      return 0
    })

  const selectedClassName = selectedClassId
    ? classes.find(c => c.class_id === parseInt(selectedClassId))?.class_name
    : 'All Classes'
  const sortLabel = { newest: 'Newest First', oldest: 'Oldest First', az: 'A → Z', za: 'Z → A' }

  /* ── Inline styles (avoids Tailwind purge issues for dynamic values) ── */
  const S = {
    root:    { fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f6f8fb', padding: '32px 20px' },
    card:    { background: 'white', borderRadius: 20, border: '1px solid #e8edf3', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
    th:      { padding: '13px 26px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    thRight: { padding: '13px 26px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    td:      { padding: '14px 26px' },
    tdRight: { padding: '14px 26px', textAlign: 'right' },
    input:   { padding: '6px 11px', border: '1.5px solid #c7d2fe', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#1e293b', background: 'white', outline: 'none', fontFamily: "'DM Sans', sans-serif" },
    iconBtn: (type) => ({
      borderRadius: 10, padding: '7px', border: '1px solid transparent', background: 'transparent',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
      ...(type === 'save'   ? { background: '#6366f1', borderColor: '#6366f1', color: 'white' } : {}),
      ...(type === 'cancel' ? { background: '#f1f5f9', borderColor: '#e2e8f0', color: '#64748b' } : {}),
      ...(type === 'edit'   ? { color: '#64748b' } : {}),
      ...(type === 'delete' ? { color: '#64748b' } : {}),
    }),
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        .sl-row { transition: background 0.13s; }
        .sl-row:hover { background: #f8fafc !important; }
        .sl-row.sl-editing { background: #f5f7ff !important; }
        .sl-row:hover .sl-edit-btn  { background: #fef9c3 !important; border-color: #fde68a !important; color: #d97706 !important; }
        .sl-row:hover .sl-delete-btn { background: #fff1f2 !important; border-color: #fecdd3 !important; color: #e11d48 !important; }
        .sl-save-btn:hover   { background: #4f46e5 !important; }
        .sl-cancel-btn:hover { background: #e2e8f0 !important; }
        .sl-input-field:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.10); }
        .sl-skeleton { background: linear-gradient(90deg,#f1f5f9 25%,#e8edf3 50%,#f1f5f9 75%); background-size: 200% 100%; animation: sl-shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes sl-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .sl-fade { animation: sl-fadeup 0.28s ease both; }
        @keyframes sl-fadeup { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .sl-dropdown-item:hover { background: #f1f5f9; color: #1e293b; }
        @keyframes sl-spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={S.root}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: '#0f172a', letterSpacing: -0.4 }}>Sections</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#94a3b8', fontWeight: 400 }}>Manage class sections and their capacities</p>
            </div>
            <button
              onClick={() => navigate('/admin/sections/add')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '9px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.22)', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              <Plus style={{ width: 16, height: 16 }} />
              Add Section
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8edf3', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px' }}>
              <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by class name or section..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="sl-input-field"
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13.5, color: '#1e293b', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              />
            </div>
            <div style={{ width: 1, height: 20, background: '#e8edf3' }} />

            {/* Class Dropdown */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setShowClassDropdown(!showClassDropdown); setShowSortDropdown(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minWidth: 128 }}
              >
                <BookOpen style={{ width: 13, height: 13, color: '#6366f1' }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{selectedClassName}</span>
                <ChevronDown style={{ width: 12, height: 12, opacity: 0.45 }} />
              </button>
              {showClassDropdown && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.09)', zIndex: 40, minWidth: 185, padding: 4 }}>
                  <button className="sl-dropdown-item" onClick={() => handleClassFilter('')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#475569', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>All Classes</button>
                  {classes.map(cls => (
                    <button key={cls.class_id} className="sl-dropdown-item" onClick={() => handleClassFilter(cls.class_id.toString())} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#475569', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {cls.class_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowClassDropdown(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                <SlidersHorizontal style={{ width: 13, height: 13, color: '#6366f1' }} />
                {sortLabel[sortOrder]}
                <ChevronDown style={{ width: 12, height: 12, opacity: 0.45 }} />
              </button>
              {showSortDropdown && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.09)', zIndex: 40, minWidth: 165, padding: 4 }}>
                  {Object.entries(sortLabel).map(([val, label]) => (
                    <button key={val} className="sl-dropdown-item" onClick={() => { setSortOrder(val); setShowSortDropdown(false) }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#475569', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={S.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Class Name</th>
                  <th style={S.th}>Section</th>
                  <th style={S.th}>Capacity</th>
                  <th style={S.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Skeletons */}
                {loading && [1,2,3,4].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={S.td}><div className="sl-skeleton" style={{ height: 15, width: 100 }} /></td>
                    <td style={S.td}><div className="sl-skeleton" style={{ height: 24, width: 50, borderRadius: 9 }} /></td>
                    <td style={S.td}><div className="sl-skeleton" style={{ height: 24, width: 52, borderRadius: 10 }} /></td>
                    <td style={S.tdRight}><div className="sl-skeleton" style={{ height: 30, width: 68, marginLeft: 'auto', borderRadius: 10 }} /></td>
                  </tr>
                ))}

                {/* Data rows */}
                {!loading && filteredSections.map((section, idx) => {
                  const isEditing = editingId === section.section_id
                  return (
                    <tr
                      key={section.section_id}
                      className={`sl-row sl-fade ${isEditing ? 'sl-editing' : ''}`}
                      style={{ borderBottom: idx === filteredSections.length - 1 ? 'none' : '1px solid #f1f5f9', animationDelay: `${idx * 0.035}s` }}
                    >
                      {/* Class */}
                      <td style={S.td}>
                        {isEditing ? (
                          <select
                            value={editData.class_id}
                            onChange={e => setEditData(p => ({ ...p, class_id: e.target.value }))}
                            className="sl-input-field"
                            style={{ ...S.input, minWidth: 145 }}
                          >
                            {classes.map(cls => <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                            {section.class_name || section.className || section.class?.class_name ||
                              classes.find(c => c.class_id === section.class_id)?.class_name || '—'}
                          </span>
                        )}
                      </td>

                      {/* Section Name */}
                      <td style={S.td}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.section_name}
                            onChange={e => setEditData(p => ({ ...p, section_name: e.target.value }))}
                            maxLength={5}
                            className="sl-input-field"
                            style={{ ...S.input, width: 72, textTransform: 'uppercase', fontWeight: 600 }}
                            placeholder="A"
                          />
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 13px', background: '#f1f5f9', color: '#334155', borderRadius: 9, fontSize: 13, fontWeight: 700, letterSpacing: 0.6, border: '1px solid #e2e8f0' }}>
                            {/* Handle both plain "A" and "A (0/40) – Vacant" formats */}
                            {(section.section_name || '').split(' ')[0] || section.section_name}
                          </span>
                        )}
                      </td>

                      {/* Capacity */}
                      <td style={S.td}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            value={editData.capacity}
                            onChange={e => setEditData(p => ({ ...p, capacity: e.target.value }))}
                            className="sl-input-field"
                            style={{ ...S.input, width: 85, fontWeight: 600 }}
                            placeholder="40"
                          />
                        ) : (
                          <CapacityBadge value={section.capacity} />
                        )}
                      </td>

                      {/* Actions */}
                      <td style={S.tdRight}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {isEditing ? (
                            <>
                              <button
                                className="sl-save-btn"
                                onClick={() => saveEdit(section)}
                                disabled={saving}
                                style={S.iconBtn('save')}
                                title="Save"
                              >
                                {saving
                                  ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'sl-spin 0.7s linear infinite' }} />
                                  : <Check style={{ width: 14, height: 14 }} />}
                              </button>
                              <button
                                className="sl-cancel-btn"
                                onClick={cancelEdit}
                                disabled={saving}
                                style={S.iconBtn('cancel')}
                                title="Cancel"
                              >
                                <X style={{ width: 14, height: 14 }} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="sl-edit-btn"
                                onClick={() => startEdit(section)}
                                style={S.iconBtn('edit')}
                                title="Edit"
                              >
                                <Pencil style={{ width: 14, height: 14 }} />
                              </button>
                              <button
                                className="sl-delete-btn"
                                onClick={() => setDeleteSection(section)}
                                style={S.iconBtn('delete')}
                                title="Delete"
                              >
                                <Trash2 style={{ width: 14, height: 14 }} />
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

            {/* Empty */}
            {!loading && filteredSections.length === 0 && (
              <div style={{ padding: '56px 0', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: '#f8fafc', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Users style={{ width: 22, height: 22, color: '#cbd5e1' }} />
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: '#1e293b', margin: 0 }}>No sections found</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Footer */}
            {!loading && filteredSections.length > 0 && (
              <div style={{ padding: '11px 26px', borderTop: '1px solid #f1f5f9', background: '#fafbfd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.9, textTransform: 'uppercase' }}>
                  Total {filteredSections.length} Record{filteredSections.length !== 1 ? 's' : ''}
                </span>
                {selectedClassId && (
                  <button
                    onClick={() => handleClassFilter('')}
                    style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Clear filter ×
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {deleteSection && (
        <DeleteConfirm
          section={deleteSection}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteSection(null)}
          deleting={deleting}
        />
      )}
    </>
  )
}

export default SectionList