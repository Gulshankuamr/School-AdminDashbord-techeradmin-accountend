import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Plus, X, Check, Layers, Pencil, Trash2, Users, GraduationCap } from 'lucide-react'
import { sectionService } from '../../services/sectionService/sectionService'
import { classService } from '../../services/classService/classService'
import { toast } from 'sonner'

// ─── Normalise section fields from actual API response ────────────────────────
// API returns: section_id, class_id, section_name, capacity,
//              current_students, display_name, full
function normaliseSection(sec) {
  return {
    ...sec,
    // Unify student count — API key is "current_students"
    student_count: sec.current_students ?? sec.student_count ?? sec.students_count ?? 0,
    capacity: sec.capacity ?? 0,
  }
}

function SectionRow({ sec, deletingId, onEdit, onDelete, isLast }) {
  const [hovered, setHovered] = useState(false)

  const studentCount = sec.student_count   // already normalised
  const capacity     = sec.capacity ?? 0
  const fillPct      = capacity > 0 ? Math.min(100, Math.round((studentCount / capacity) * 100)) : null
  const barColor     = fillPct >= 90 ? 'bg-red-400' : fillPct >= 70 ? 'bg-amber-400' : 'bg-blue-400'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`grid items-center gap-3 px-5 py-3 transition-colors duration-100
        ${hovered ? 'bg-slate-50' : 'bg-white'}
        ${isLast ? '' : 'border-b border-slate-100'}`}
      style={{ gridTemplateColumns: '1fr auto 64px' }}
    >
      {/* Section name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        <span className="text-sm font-bold text-slate-800 truncate">
          Section - {sec.section_name}
        </span>
      </div>

      {/* Students + Capacity info */}
      <div className="flex items-center gap-3">
        {/* Students / Capacity count */}
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 whitespace-nowrap">
          <Users className="w-3 h-3 text-slate-400" />
          {studentCount} / {capacity}
        </span>

        {/* Capacity red badge */}
        <span className="text-xs font-bold bg-red-50 text-red-500 rounded-full px-3 py-0.5 whitespace-nowrap">
          Cap - {capacity}
        </span>

        {/* Fill bar */}
        {fillPct !== null && capacity > 0 && (
          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        )}

        {/* Fill percentage */}
        {fillPct !== null && (
          <span className="text-xs font-bold text-slate-400 w-8 text-right">{fillPct}%</span>
        )}

        {/* Vacant / Full badge  — from API field "full" */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap
          ${sec.full ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {sec.full ? 'Full' : 'Vacant'}
        </span>
      </div>

      {/* Edit / Delete actions — visible on hover */}
      <div className={`flex items-center justify-end gap-1 transition-opacity duration-150
        ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          disabled={deletingId === sec.section_id}
          className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
          title="Delete"
        >
          {deletingId === sec.section_id
            ? <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full inline-block animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

function SectionEditRow({ sec, onSave, onCancel }) {
  const [name, setName]     = useState(sec.section_name ?? '')
  const [cap, setCap]       = useState(sec.capacity?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])

  const save = async () => {
    if (!name.trim()) return toast.error('Section name is required')
    if (!cap || isNaN(cap) || Number(cap) <= 0) return toast.error('Valid capacity is required')
    setSaving(true)
    try { await onSave(sec.section_id, name.trim(), Number(cap)) }
    catch { } finally { setSaving(false) }
  }

  return (
    <div className="flex items-center bg-blue-50 border-b border-blue-100">
      <div className="flex items-center gap-1.5 px-5 py-2.5 border-r border-blue-200">
        <Pencil className="w-3 h-3 text-blue-400" />
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Section-</span>
        <input
          ref={ref} value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
          placeholder="A"
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 w-20 placeholder:text-slate-300"
        />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-r border-blue-200">
        <Users className="w-3 h-3 text-red-400" />
        <span className="text-xs font-bold text-red-400">Cap-</span>
        <input
          type="number" min="1" value={cap} onChange={e => setCap(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
          placeholder="40"
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 w-14 placeholder:text-slate-300"
        />
      </div>
      <button
        onClick={save} disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-bold transition-colors border-r border-blue-400"
      >
        {saving
          ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full inline-block animate-spin" />
          : <Check className="w-3.5 h-3.5" />}
        <span>{saving ? '...' : 'Save'}</span>
      </button>
      <button onClick={onCancel} className="flex items-center px-3 py-2.5 text-slate-500 hover:bg-blue-100 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function SectionAddRow({ classId, onSaved, onCancel }) {
  const [name, setName]     = useState('')
  const [cap, setCap]       = useState('')
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])

  const save = async () => {
    if (!name.trim()) return toast.error('Section name is required')
    if (!cap || isNaN(cap) || Number(cap) <= 0) return toast.error('Valid capacity is required')
    setSaving(true)
    try {
      await sectionService.createSection({
        section_name: name.trim(),
        class_id:     classId,
        capacity:     Number(cap),
      })
      toast.success(`Section "${name.trim()}" added!`)
      onSaved() // parent will re-fetch from backend
    } catch (err) {
      toast.error(err.message || 'Failed to add section')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center bg-emerald-50 border-t border-emerald-100">
      <div className="flex items-center gap-1.5 px-5 py-2.5 border-r border-emerald-200">
        <Plus className="w-3 h-3 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Section-</span>
        <input
          ref={ref} value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
          placeholder="A"
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 w-20 placeholder:text-slate-300"
        />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-r border-emerald-200">
        <Users className="w-3 h-3 text-red-400" />
        <span className="text-xs font-bold text-red-400">Cap-</span>
        <input
          type="number" min="1" value={cap} onChange={e => setCap(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
          placeholder="40"
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 w-14 placeholder:text-slate-300"
        />
      </div>
      <button
        onClick={save} disabled={saving || !name.trim() || !cap}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-xs font-bold transition-colors border-r border-emerald-400"
      >
        {saving
          ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full inline-block animate-spin" />
          : <Check className="w-3.5 h-3.5" />}
        <span>{saving ? '...' : 'Add'}</span>
      </button>
      <button onClick={onCancel} className="flex items-center px-3 py-2.5 text-slate-500 hover:bg-emerald-100 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function ClassRow({ classItem, defaultOpen = false, onClassUpdated, onClassDeleted }) {
  const [sections, setSections]         = useState([])
  const [loadingSec, setLoadingSec]     = useState(false)
  const [adding, setAdding]             = useState(false)
  const [editingSecId, setEditingSecId] = useState(null)
  const [deletingId, setDeletingId]     = useState(null)
  const [expanded, setExpanded]         = useState(defaultOpen)

  const [displayName, setDisplayName]     = useState(classItem.class_name)
  const [editingClass, setEditingClass]   = useState(false)
  const [editClassName, setEditClassName] = useState(classItem.class_name)
  const [classSaving, setClassSaving]     = useState(false)
  const [showDelClass, setShowDelClass]   = useState(false)
  const [deletingClass, setDeletingClass] = useState(false)
  const classNameRef = useRef(null)

  useEffect(() => { if (editingClass) classNameRef.current?.focus() }, [editingClass])

  // ─── Single source of truth: always fetch from backend ───────────────────────
  const fetchSections = useCallback(async () => {
    setLoadingSec(true)
    try {
      const res = await sectionService.getAllSections(classItem.class_id)
      const raw = Array.isArray(res.data) ? res.data : []
      setSections(raw.map(normaliseSection))
    } catch {
      toast.error('Failed to load sections')
    } finally {
      setLoadingSec(false)
    }
  }, [classItem.class_id])

  // Fetch immediately if defaultOpen
  useEffect(() => {
    if (defaultOpen) fetchSections()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExpand = () => {
    const next = !expanded
    setExpanded(next)
    if (next) fetchSections()
  }

  // ─── Class rename ─────────────────────────────────────────────────────────────
  const handleSaveClass = async () => {
    if (!editClassName.trim()) return toast.error('Class name is required')
    setClassSaving(true)
    try {
      await classService.updateClass({ class_id: classItem.class_id, class_name: editClassName.trim() })
      toast.success(`Class renamed to "${editClassName.trim()}"!`)
      setDisplayName(editClassName.trim())
      setEditingClass(false)
      onClassUpdated?.({ ...classItem, class_name: editClassName.trim() })
    } catch (err) {
      toast.error(err.message || 'Failed to update class')
    } finally {
      setClassSaving(false)
    }
  }

  // ─── Class delete ─────────────────────────────────────────────────────────────
  const handleDeleteClass = async () => {
    setDeletingClass(true)
    try {
      await classService.deleteClass(classItem.class_id)
      toast.success('Class deleted!')
      onClassDeleted?.(classItem.class_id)
    } catch (err) {
      toast.error(err.message || 'Failed to delete class')
      setDeletingClass(false)
      setShowDelClass(false)
    }
  }

  // ─── Section update → re-fetch ────────────────────────────────────────────────
  const handleUpdateSection = async (sectionId, name, cap) => {
    try {
      await sectionService.updateSection({
        section_id:   sectionId,
        section_name: name,
        class_id:     classItem.class_id,
        capacity:     cap,
      })
      toast.success('Section updated!')
      setEditingSecId(null)
      await fetchSections()
    } catch (err) {
      toast.error(err.message || 'Failed to update section')
      throw err
    }
  }

  // ─── Section delete → re-fetch ────────────────────────────────────────────────
  const handleDeleteSection = async (sectionId, sectionName) => {
    if (!window.confirm(`Delete section "${sectionName}"?`)) return
    setDeletingId(sectionId)
    try {
      await sectionService.deleteSection(sectionId)
      toast.success(`Section "${sectionName}" deleted!`)
      await fetchSections()
    } catch (err) {
      toast.error(err.message || 'Failed to delete section')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Section added → re-fetch ─────────────────────────────────────────────────
  const handleSectionAdded = async () => {
    setAdding(false)
    await fetchSections()
  }

  const sectionCount = sections.length

  return (
    <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-200
      ${expanded
        ? 'border border-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.08)]'
        : 'border border-slate-200 shadow-sm'}`}>

      {/* ── Class header row ── */}
      <div className="flex items-center pr-3">
        <button
          onClick={handleExpand}
          className="flex-1 flex items-center gap-3 px-5 py-4 text-left bg-transparent border-none cursor-pointer hover:bg-slate-50 transition-colors min-w-0"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-200
            ${expanded ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
            <GraduationCap className={`w-4 h-4 ${expanded ? 'text-blue-500' : 'text-slate-400'}`} />
          </div>

          {editingClass ? (
            <div className="flex items-center gap-0 flex-1" onClick={e => e.stopPropagation()}>
              <input
                ref={classNameRef} value={editClassName} onChange={e => setEditClassName(e.target.value)}
                onKeyDown={e => {
                  e.stopPropagation()
                  if (e.key === 'Enter') handleSaveClass()
                  if (e.key === 'Escape') { setEditingClass(false); setEditClassName(displayName) }
                }}
                className="text-sm font-bold text-slate-900 bg-blue-50 border-2 border-blue-400 border-r-0 rounded-l-lg px-3 py-1.5 outline-none min-w-36"
              />
              <button
                onClick={handleSaveClass} disabled={classSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-bold transition-colors"
              >
                {classSaving
                  ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full inline-block animate-spin" />
                  : <Check className="w-3 h-3" />}
                <span>{classSaving ? '...' : 'Save'}</span>
              </button>
              <button
                onClick={() => { setEditingClass(false); setEditClassName(displayName) }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-r-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 tracking-tight">{displayName}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all duration-200
                  ${expanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {sectionCount} Section{sectionCount !== 1 ? 's' : ''}
                </span>
              </div>
              {classItem.class_code && (
                <span className="text-xs text-slate-400 font-medium">Code: {classItem.class_code}</span>
              )}
            </div>
          )}

          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-250
            ${expanded ? 'rotate-180' : 'rotate-0'}`} />
        </button>

        {!editingClass && !showDelClass && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setEditingClass(true); setExpanded(true) }}
              title="Edit class name"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setShowDelClass(true) }}
              title="Delete class"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {showDelClass && (
          <div className="flex items-center gap-2 pr-1" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Delete class?</span>
            <button
              onClick={handleDeleteClass} disabled={deletingClass}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {deletingClass ? '...' : 'Yes'}
            </button>
            <button
              onClick={() => setShowDelClass(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* ── Sections panel ── */}
      {expanded && (
        <div className="border-t border-slate-100">
          {loadingSec ? (
            <div className="p-4 flex flex-col gap-2">
              {[1, 2].map(i => (
                <div key={i} className="h-11 rounded-lg bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" />
              ))}
            </div>
          ) : sections.length === 0 && !adding ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No sections yet</p>
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Table header */}
              {sections.length > 0 && (
                <div
                  className="grid px-5 py-2 border-b border-slate-100"
                  style={{ gridTemplateColumns: '1fr auto 64px' }}
                >
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Section</span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-widest text-center pr-16">Students / Capacity</span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-widest text-right">Actions</span>
                </div>
              )}

              {/* Section rows */}
              {sections.map((sec, idx) =>
                editingSecId === sec.section_id ? (
                  <SectionEditRow
                    key={sec.section_id}
                    sec={sec}
                    onSave={handleUpdateSection}
                    onCancel={() => setEditingSecId(null)}
                  />
                ) : (
                  <SectionRow
                    key={sec.section_id}
                    sec={sec}
                    deletingId={deletingId}
                    onEdit={() => setEditingSecId(sec.section_id)}
                    onDelete={() => handleDeleteSection(sec.section_id, sec.section_name)}
                    isLast={idx === sections.length - 1 && !adding}
                  />
                )
              )}

              {/* Add section row or button */}
              {adding ? (
                <SectionAddRow
                  classId={classItem.class_id}
                  onSaved={handleSectionAdded}
                  onCancel={() => setAdding(false)}
                />
              ) : (
                <div className="px-5 py-3">
                  <button
                    onClick={() => setAdding(true)}
                    className="flex items-center gap-1.5 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClassRow