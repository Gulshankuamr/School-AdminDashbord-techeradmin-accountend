import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Pencil, Search, ChevronDown, AlertCircle, SlidersHorizontal, GraduationCap, Plus } from 'lucide-react'
import Modal from '../../components/Modal'
import ClassDetailsModal from './ClassDetailsModal'
import EditClass from './EditClass'
import { classService } from '../../services/classService/classService'
import { toast } from 'sonner'

function ClassList() {
  const navigate = useNavigate()

  const [classes, setClasses]                     = useState([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [search, setSearch]                       = useState('')
  const [sortOrder, setSortOrder]                 = useState('newest')
  const [showSortDropdown, setShowSortDropdown]   = useState(false)
  const [isViewOpen, setIsViewOpen]               = useState(false)
  const [selectedClass, setSelectedClass]         = useState(null)
  const [isEditOpen, setIsEditOpen]               = useState(false)
  const [editingClass, setEditingClass]           = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [classToDelete, setClassToDelete]         = useState(null)
  const [deleting, setDeleting]                   = useState(false)

  const fetchClasses = async () => {
    try {
      setLoading(true); setError(null)
      const res = await classService.getAllClasses()
      setClasses(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load classes')
      toast.error(err.message || 'Failed to load classes')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchClasses() }, [])
  useEffect(() => {
    const h = () => { setShowSortDropdown(false) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  const filteredClasses = classes
    .filter(c => {
      const q = search.toLowerCase()
      return c.class_name?.toLowerCase().includes(q) || c.class_code?.toString().toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.class_id - a.class_id
      if (sortOrder === 'oldest') return a.class_id - b.class_id
      if (sortOrder === 'az')     return a.class_name?.localeCompare(b.class_name)
      if (sortOrder === 'za')     return b.class_name?.localeCompare(a.class_name)
      return 0
    })

  const handleEditClass   = (c) => { setEditingClass(c); setIsEditOpen(true) }
  const handleDeleteClick = (c) => { setClassToDelete(c); setShowDeleteConfirm(true) }
  const cancelDelete      = () => { setShowDeleteConfirm(false); setClassToDelete(null) }

  const confirmDelete = async () => {
    if (!classToDelete?.class_id) return toast.error('Invalid class ID')
    try {
      setDeleting(true)
      await classService.deleteClass(classToDelete.class_id)
      setClasses(prev => prev.filter(c => c.class_id !== classToDelete.class_id))
      setShowDeleteConfirm(false); setClassToDelete(null)
      toast.success('Class deleted successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to delete class')
      await fetchClasses()
    } finally { setDeleting(false) }
  }

  const sortLabel = { newest: 'Newest First', oldest: 'Oldest First', az: 'A → Z', za: 'Z → A' }

  const S = {
    root:    { fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f6f8fb', padding: '32px 20px' },
    card:    { background: 'white', borderRadius: 20, border: '1px solid #e8edf3', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
    th:      { padding: '13px 26px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    thRight: { padding: '13px 26px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    td:      { padding: '15px 26px' },
    tdRight: { padding: '15px 26px', textAlign: 'right' },
    iconBtn: (type) => ({
      borderRadius: 10, padding: '7px', border: '1px solid transparent', background: 'transparent',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
      ...(type === 'edit'   ? { color: '#64748b' } : {}),
      ...(type === 'delete' ? { color: '#64748b' } : {}),
    }),
  }

  /* ── Loading ── */
  if (loading && classes.length === 0) {
    return (
      <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'cl-spin 0.75s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>Loading classes...</p>
        </div>
        <style>{`@keyframes cl-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 32px', textAlign: 'center', maxWidth: 340, border: '1px solid #e8edf3', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <AlertCircle style={{ width: 40, height: 40, color: '#f43f5e', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: '0 0 6px' }}>Something went wrong</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>{error}</p>
          <button onClick={fetchClasses} style={{ padding: '9px 22px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 11, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        .cl-row { transition: background 0.13s; }
        .cl-row:hover { background: #f8fafc !important; }
        .cl-row:hover .cl-edit-btn   { background: #fef9c3 !important; border-color: #fde68a !important; color: #d97706 !important; }
        .cl-row:hover .cl-delete-btn { background: #fff1f2 !important; border-color: #fecdd3 !important; color: #e11d48 !important; }
        .cl-dropdown-item:hover { background: #f1f5f9; color: #1e293b; }
        .cl-skeleton { background: linear-gradient(90deg,#f1f5f9 25%,#e8edf3 50%,#f1f5f9 75%); background-size: 200% 100%; animation: cl-shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes cl-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .cl-fade { animation: cl-fadeup 0.28s ease both; }
        @keyframes cl-fadeup { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cl-spin { to { transform: rotate(360deg) } }
        .cl-add-btn:hover { background: #4f46e5 !important; }
      `}</style>

      <div style={S.root}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: '#0f172a', letterSpacing: -0.4 }}>Class Management</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#94a3b8', fontWeight: 400 }}>Manage all school classes and their details</p>
            </div>
            <button
              className="cl-add-btn"
              onClick={() => navigate('/admin/sections/add')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '9px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.22)', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              Add section
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8edf3', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px' }}>
              <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by class name or code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13.5, color: '#1e293b', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              />
            </div>
            <div style={{ width: 1, height: 20, background: '#e8edf3' }} />

            {/* Sort Dropdown */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#f8fafc', border: '1px solid #e8edf3', borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                <SlidersHorizontal style={{ width: 13, height: 13, color: '#6366f1' }} />
                {sortLabel[sortOrder]}
                <ChevronDown style={{ width: 12, height: 12, opacity: 0.45 }} />
              </button>
              {showSortDropdown && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.09)', zIndex: 40, minWidth: 165, padding: 4 }}>
                  {Object.entries(sortLabel).map(([val, label]) => (
                    <button key={val} className="cl-dropdown-item"
                      onClick={() => { setSortOrder(val); setShowSortDropdown(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, fontWeight: sortOrder === val ? 600 : 500, color: sortOrder === val ? '#6366f1' : '#475569', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div style={S.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Class Name</th>
                  <th style={S.th}>Class Code</th>
                  <th style={S.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>

                {/* Skeletons */}
                {loading && [1,2,3,4].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={S.td}><div className="cl-skeleton" style={{ height: 15, width: 110 }} /></td>
                    <td style={S.td}><div className="cl-skeleton" style={{ height: 24, width: 72, borderRadius: 9 }} /></td>
                    <td style={S.tdRight}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <div className="cl-skeleton" style={{ height: 30, width: 30, borderRadius: 10 }} />
                        <div className="cl-skeleton" style={{ height: 30, width: 30, borderRadius: 10 }} />
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Rows */}
                {!loading && filteredClasses.map((classItem, idx) => (
                  <tr
                    key={classItem.class_id}
                    className="cl-row cl-fade"
                    style={{ borderBottom: idx === filteredClasses.length - 1 ? 'none' : '1px solid #f1f5f9', animationDelay: `${idx * 0.035}s` }}
                  >
                    {/* Class Name */}
                    <td style={S.td}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{classItem.class_name}</span>
                    </td>

                    {/* Class Code */}
                    <td style={S.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 11px', background: '#eff6ff', color: '#3b82f6', borderRadius: 9, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, border: '1px solid #dbeafe' }}>
                        {classItem.class_code || '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={S.tdRight}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          className="cl-edit-btn"
                          onClick={() => handleEditClass(classItem)}
                          style={S.iconBtn('edit')}
                          title="Edit"
                        >
                          <Pencil style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          className="cl-delete-btn"
                          onClick={() => handleDeleteClick(classItem)}
                          style={S.iconBtn('delete')}
                          title="Delete"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {!loading && filteredClasses.length === 0 && (
              <div style={{ padding: '56px 0', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: '#f8fafc', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <GraduationCap style={{ width: 22, height: 22, color: '#cbd5e1' }} />
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: '#1e293b', margin: 0 }}>No classes found</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
                  {search ? 'Try adjusting your search.' : 'Add your first class to get started.'}
                </p>
              </div>
            )}

            {/* Footer */}
            {!loading && filteredClasses.length > 0 && (
              <div style={{ padding: '11px 26px', borderTop: '1px solid #f1f5f9', background: '#fafbfd' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.9, textTransform: 'uppercase' }}>
                  Showing {filteredClasses.length} of {classes.length} Class{classes.length !== 1 ? 'es' : ''}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelectedClass(null) }} title="Class Details">
        {selectedClass && (
          <ClassDetailsModal classItem={selectedClass} onClose={() => { setIsViewOpen(false); setSelectedClass(null) }} />
        )}
      </Modal>

      {/* Edit Modal */}
      {isEditOpen && editingClass && (
        <EditClass
          classItem={editingClass}
          onClose={() => { setIsEditOpen(false); setEditingClass(null) }}
          onSaved={fetchClasses}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)', fontFamily: "'DM Sans', sans-serif" }}
          onClick={cancelDelete}
        >
          <div
            style={{ background: 'white', borderRadius: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 360, padding: '32px 28px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#fff1f2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 style={{ width: 24, height: 24, color: '#f43f5e' }} />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Delete Class?</p>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                You're about to delete{' '}
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{classToDelete?.class_name}</span>.
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button
                onClick={cancelDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '11px 0', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '11px 0', background: '#f43f5e', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 14px rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s', opacity: deleting ? 0.65 : 1 }}
              >
                {deleting ? (
                  <>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'cl-spin 0.7s linear infinite' }} />
                    Deleting...
                  </>
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ClassList