import React, { useState } from 'react'
import { Pencil, Trash2, Users, Check, X } from 'lucide-react'
import { sectionService } from '../../services/sectionService/sectionService'
import { toast } from 'sonner'

function SectionPill({ section, onDeleted, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName]   = useState(section.section_name ?? section.name ?? '')
  const [editCap, setEditCap]     = useState(section.capacity ?? '')
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [showDel, setShowDel]     = useState(false)
  const [hovered, setHovered]     = useState(false)

  // Normalise field names — API might return different keys
  const sectionName  = section.section_name ?? section.name ?? '—'
  const sectionId    = section.section_id   ?? section.id
  const classId      = section.class_id
  const capacity     = section.capacity     ?? null
  const studentCount = section.student_count ?? section.students_count ?? null

  const fillPct = (capacity && studentCount !== null)
    ? Math.min(100, Math.round((studentCount / capacity) * 100))
    : null

  const barColor = fillPct >= 90 ? '#ef4444'
    : fillPct >= 70  ? '#f59e0b'
    : '#22c55e'

  const handleSave = async () => {
    if (!editName.trim()) return toast.error('Name is required')
    if (!editCap || isNaN(editCap) || Number(editCap) <= 0)
      return toast.error('Enter a valid capacity')
    setSaving(true)
    try {
      await sectionService.updateSection({
        section_id:   sectionId,
        section_name: editName.trim(),
        class_id:     classId,
        capacity:     Number(editCap),
      })
      toast.success('Section updated!')
      onUpdated({ ...section, section_name: editName.trim(), capacity: Number(editCap) })
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await sectionService.deleteSection(sectionId)
      toast.success('Section deleted!')
      onDeleted(sectionId)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
      setDeleting(false)
      setShowDel(false)
    }
  }

  const iStyle = {
    border: 'none', background: 'transparent', fontSize: 12.5,
    fontWeight: 600, color: '#1e293b', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  }

  /* ──────────────── EDIT MODE ──────────────── */
  if (isEditing) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: '#f0f9ff', border: '2px solid #3b82f6',
        borderRadius: 13, overflow: 'hidden',
        animation: 'secFadeIn 0.15s ease both',
        boxShadow: '0 2px 10px rgba(59,130,246,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRight: '1.5px solid #bfdbfe' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</span>
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false) }}
            style={{ ...iStyle, width: 86 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRight: '1.5px solid #bfdbfe' }}>
          <Users style={{ width: 11, height: 11, color: '#93c5fd' }} />
          <input
            type="number" min="1"
            value={editCap}
            onChange={e => setEditCap(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false) }}
            placeholder="Cap"
            style={{ ...iStyle, width: 52 }}
          />
        </div>
        <button
          onClick={handleSave} disabled={saving}
          style={{
            background: saving ? '#93c5fd' : '#3b82f6',
            border: 'none', padding: '7px 11px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            borderRight: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {saving
            ? <span style={{ width: 11, height: 11, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'secSpin 0.6s linear infinite' }} />
            : <Check style={{ width: 11, height: 11, color: 'white' }} />
          }
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
            {saving ? '...' : 'Save'}
          </span>
        </button>
        <button
          onClick={() => setIsEditing(false)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '7px 9px', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <X style={{ width: 13, height: 13, color: '#64748b' }} />
        </button>
      </div>
    )
  }

  /* ──────────────── VIEW MODE ──────────────── */
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowDel(false) }}
      style={{
        display: 'inline-flex', flexDirection: 'column', gap: 6,
        background: hovered ? '#fafbfe' : 'white',
        border: `1.5px solid ${hovered ? '#bfdbfe' : '#e2e8f0'}`,
        borderRadius: 13, padding: '10px 13px',
        transition: 'all 0.15s',
        animation: 'secFadeIn 0.3s ease both',
        boxShadow: hovered
          ? '0 3px 12px rgba(59,130,246,0.1)'
          : '0 1px 3px rgba(0,0,0,0.05)',
        minWidth: 110,
        cursor: 'default',
      }}
    >
      {/* ── Row 1: section name + actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Section name — bold dark */}
        <span style={{
          fontSize: 13.5, fontWeight: 700, color: '#0f172a',
          fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.2,
        }}>
          {sectionName}
        </span>

        {/* Edit / Delete on hover */}
        {hovered && !showDel && (
          <div style={{ display: 'flex', gap: 2, animation: 'secFadeIn 0.1s ease both' }}>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 4px', borderRadius: 6, display: 'flex', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <Pencil style={{ width: 11, height: 11 }} />
            </button>
            <button
              onClick={() => setShowDel(true)}
              title="Delete"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 4px', borderRadius: 6, display: 'flex', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffe4e6'; e.currentTarget.style.color = '#e11d48' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <Trash2 style={{ width: 11, height: 11 }} />
            </button>
          </div>
        )}

        {/* Inline delete confirm */}
        {showDel && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', animation: 'secFadeIn 0.1s ease both' }}>
            <button
              onClick={handleDelete} disabled={deleting}
              style={{ background: '#ef4444', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              {deleting ? '...' : 'Yes'}
            </button>
            <button
              onClick={() => setShowDel(false)}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* ── Row 2: students / capacity (capacity in red badge) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>

        {/* Students count */}
        {studentCount !== null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 600, color: '#64748b',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Users style={{ width: 10, height: 10, color: '#94a3b8' }} />
            {studentCount} students
          </span>
        )}

        {/* Separator dot */}
        {studentCount !== null && capacity !== null && (
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
        )}

        {/* ✅ Capacity in RED badge */}
        {capacity !== null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#fff1f2', color: '#e11d48',
            border: '1px solid #fecdd3',
            borderRadius: 20, padding: '1px 8px',
            fontSize: 11, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Cap: {capacity}
          </span>
        )}
      </div>

      {/* ── Row 3: fill bar (only if both student count and capacity available) ── */}
      {fillPct !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 3.5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${fillPct}%`,
              background: barColor, borderRadius: 99,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
            {fillPct}%
          </span>
        </div>
      )}
    </div>
  )
}

export default SectionPill