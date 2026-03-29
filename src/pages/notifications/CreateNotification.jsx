import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/notificationService/notificationService'
import {
  Bell, X, Plus, Send, ChevronDown, Users,
  BookOpen, Layers, Shield, Loader2, CheckCircle, AlertCircle,
  ArrowLeft
} from 'lucide-react'

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all animate-slide-in
      ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
    >
      {toast.type === 'success'
        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 flex-shrink-0" />
      }
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Target Types ─────────────────────────────────────────────────────────────
// ✅ FIX: key changed from 'role' → 'role_based' to match backend expectation
const TARGET_TYPES = [
  { key: 'school_wide', label: 'School Wide',    icon: Users,    color: 'text-orange-500', bg: 'bg-orange-50 border-orange-300' },
  { key: 'class',       label: 'Class',          icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-300' },
  { key: 'class_section', label: 'Class + Section', icon: Layers, color: 'text-green-500', bg: 'bg-green-50 border-green-300' },
  { key: 'role_based',  label: 'Role Based',     icon: Shield,   color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-300'   },
]

const ROLES = ['teacher', 'student', 'staff']

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCreateForm = () => (
  <div className="max-w-3xl mx-auto animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-72 bg-gray-100 rounded mb-8" />
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i}>
          <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-11 w-full bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateNotification = () => {
  const navigate = useNavigate()

  const [title, setTitle]                   = useState('')
  const [description, setDescription]       = useState('')
  const [selectedTargetType, setSelectedTargetType] = useState('school_wide')
  const [targets, setTargets]               = useState([])
  const [selectedClass, setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedRole, setSelectedRole]     = useState('')

  const [classes, setClasses]               = useState([])
  const [sections, setSections]             = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingSections, setLoadingSections] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]           = useState(null)
  const [errors, setErrors]         = useState({})

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true)
        const res = await notificationService.getAllClasses()
        setClasses(res?.data || [])
      } catch (err) {
        console.error('Failed to load classes:', err)
        setClasses([])
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [])

  // Load sections when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSections([])
      setSelectedSection('')
      return
    }
    const fetchSections = async () => {
      try {
        setLoadingSections(true)
        const res = await notificationService.getSectionsByClass(selectedClass)
        setSections(res?.data || [])
      } catch (err) {
        console.error('Failed to load sections:', err)
        setSections([])
      } finally {
        setLoadingSections(false)
        setSelectedSection('')
      }
    }
    fetchSections()
  }, [selectedClass])

  // Reset selectors on target type change
  useEffect(() => {
    setSelectedClass('')
    setSelectedSection('')
    setSelectedRole('')
    setTargets([])
  }, [selectedTargetType])

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Notification title is required'
    if (!description.trim()) errs.description = 'Description is required'
    if (selectedTargetType !== 'school_wide' && targets.length === 0) {
      errs.targets = 'Please add at least one target recipient'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ✅ FIX: 'role_based' used in case and target_type value
  const buildTargetObj = () => {
    switch (selectedTargetType) {
      case 'school_wide':
        return { target_type: 'school_wide' }

      case 'class':
        if (!selectedClass) return null
        return { target_type: 'class', class_id: Number(selectedClass) }

      case 'class_section':
        if (!selectedClass || !selectedSection) return null
        return {
          target_type: 'class_section',
          class_id: Number(selectedClass),
          section_id: Number(selectedSection),
        }

      case 'role_based':
        if (!selectedRole) return null
        return { target_type: 'role_based', role: selectedRole }  // ✅ FIXED

      default:
        return null
    }
  }

  const handleAddTarget = () => {
    if (selectedTargetType === 'school_wide') {
      setTargets([{ target_type: 'school_wide', label: 'All School' }])
      return
    }

    const obj = buildTargetObj()
    if (!obj) return

    let label = ''
    if (selectedTargetType === 'class') {
      const cls = classes.find(c => String(c.class_id) === String(selectedClass))
      label = cls?.class_name || `Class ${selectedClass}`
    }
    if (selectedTargetType === 'class_section') {
      const cls = classes.find(c => String(c.class_id) === String(selectedClass))
      const sec = sections.find(s => String(s.section_id) === String(selectedSection))
      label = `${cls?.class_name || selectedClass} - ${sec?.section_name || selectedSection}`
    }
    // ✅ FIX: 'role_based' check
    if (selectedTargetType === 'role_based') {
      label = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + 's'
    }

    const duplicate = targets.find(t =>
      t.target_type === obj.target_type &&
      t.class_id    === obj.class_id    &&
      t.section_id  === obj.section_id  &&
      t.role        === obj.role
    )
    if (!duplicate) {
      setTargets(prev => [...prev, { ...obj, label }])
    }
  }

  const removeTarget = (idx) => setTargets(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    if (!validate()) return

    const finalTargets = targets.length > 0
      ? targets.map(({ label, ...rest }) => rest)
      : [{ target_type: 'school_wide' }]

    console.log('📤 Sending targets:', finalTargets) // debug

    setSubmitting(true)
    setErrors({})

    try {
      await notificationService.createNotification({
        title:       title.trim(),
        description: description.trim(),
        targets:     finalTargets,
      })
      setToast({ type: 'success', message: 'Notification Sent Successfully!' })
      setTimeout(() => navigate('/admin/notifications'), 1800)
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send notification' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingClasses) return <SkeletonCreateForm />

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/notifications')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Notification</h1>
          <p className="text-gray-600 text-sm mt-0.5">Compose and dispatch messages to specific groups or the entire school community.</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Notification Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })) }}
              placeholder="e.g. Annual Sports Meet 2024"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
              placeholder="Enter the details of your notification here..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Target Audience</label>
            <div className="flex flex-wrap gap-3">
              {TARGET_TYPES.map(({ key, label, icon: Icon, color, bg }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTargetType(key)}
                  className={`flex flex-col items-center gap-2 px-5 py-3.5 rounded-xl border-2 text-xs font-medium transition-all
                    ${selectedTargetType === key
                      ? `${bg} ${color} border-current shadow-sm`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${selectedTargetType === key ? color : 'text-gray-500'}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic selectors */}
          {selectedTargetType !== 'school_wide' && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">

              {/* Class selector */}
              {(selectedTargetType === 'class' || selectedTargetType === 'class_section') && (
                <div className={`grid gap-3 ${selectedTargetType === 'class_section' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Select Class</label>
                    <div className="relative">
                      <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {selectedTargetType === 'class_section' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Select Section</label>
                      <div className="relative">
                        <select
                          value={selectedSection}
                          onChange={e => setSelectedSection(e.target.value)}
                          disabled={!selectedClass || loadingSections}
                          className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {loadingSections ? 'Loading...' : 'Select Section'}
                          </option>
                          {sections.map(sec => (
                            <option key={sec.section_id} value={sec.section_id}>{sec.section_name}</option>
                          ))}
                        </select>
                        {loadingSections
                          ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                          : <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ FIX: 'role_based' check */}
              {selectedTargetType === 'role_based' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Select Role</label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Select Role</option>
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}s</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Add Target Button */}
              <button
                onClick={handleAddTarget}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                Add Target
              </button>
            </div>
          )}

          {/* Selected Recipients */}
          {(targets.length > 0 || selectedTargetType === 'school_wide') && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Selected Recipients</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[48px]">
                {selectedTargetType === 'school_wide' && targets.length === 0 && (
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> All School
                  </span>
                )}
                {targets.map((t, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    {t.label}
                    <button onClick={() => removeTarget(idx)} className="hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.targets && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.targets}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/admin/notifications')}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-4 h-4" /> Send Notification</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease forwards; }
      `}</style>
    </div>
  )
}

export default CreateNotification