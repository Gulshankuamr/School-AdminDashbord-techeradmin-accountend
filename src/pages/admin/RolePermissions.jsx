// src/pages/admin/RolePermissions.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ArrowLeft, Save, Loader2,
  CheckSquare, Square, Users, BookOpen, Wallet,
  GraduationCap, DollarSign, ClipboardCheck, FileText,
  BarChart3, Settings, AlertCircle, CheckCircle2,
  Layers, Calendar, UserCog, Bell, CreditCard, School,
} from 'lucide-react'
import { rolePermissionService } from '../../services/rolePermissionService/rolePermissionService'

// ── Roles ─────────────────────────────────────────────────────
const ROLES = [
  { id: 'teacher',    label: 'Teacher',    icon: BookOpen,      color: 'blue',   activeBg: 'bg-blue-600',    activeRing: 'ring-blue-300',   gradient: 'from-blue-500 to-blue-700'    },
  { id: 'student',    label: 'Student',    icon: GraduationCap, color: 'emerald',activeBg: 'bg-emerald-600', activeRing: 'ring-emerald-300', gradient: 'from-emerald-500 to-emerald-700'},
  { id: 'accountant', label: 'Accountant', icon: Wallet,        color: 'violet', activeBg: 'bg-violet-600',  activeRing: 'ring-violet-300',  gradient: 'from-violet-500 to-violet-700' },
  // { id: 'admin',      label: 'Admin',      icon: UserCog,       color: 'rose',   activeBg: 'bg-rose-600',    activeRing: 'ring-rose-300',    gradient: 'from-rose-500 to-rose-700'    },
]

// ── Section Meta — covers all keys returned by API (all lowercase) ──
const SECTION_META = {
  students:     { icon: Users,          color: 'blue'    },
  student:      { icon: Users,          color: 'blue'    },
  teachers:     { icon: BookOpen,       color: 'indigo'  },
  teacher:      { icon: BookOpen,       color: 'indigo'  },
  accountant:   { icon: Wallet,         color: 'violet'  },
  accountants:  { icon: Wallet,         color: 'violet'  },
  // admin:        { icon: UserCog,        color: 'rose'    },
  fees:         { icon: DollarSign,     color: 'emerald' },
  payments:     { icon: CreditCard,     color: 'emerald' },
  attendance:   { icon: ClipboardCheck, color: 'orange'  },
  exams:        { icon: FileText,       color: 'pink'    },
  reports:      { icon: BarChart3,      color: 'cyan'    },
  settings:     { icon: Settings,       color: 'gray'    },
  classes:      { icon: Calendar,       color: 'yellow'  },
  sections:     { icon: Layers,         color: 'teal'    },
  timetable:    { icon: Calendar,       color: 'teal'    },
  subjects:     { icon: BookOpen,       color: 'purple'  },
  homework:     { icon: FileText,       color: 'pink'    },
  notices:      { icon: BookOpen,       color: 'blue'    },
  notification: { icon: Bell,           color: 'orange'  },
  school:       { icon: School,         color: 'indigo'  },
}

const COLORS = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700',      border: 'border-blue-200',    },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700',  border: 'border-indigo-200',  },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  badge: 'bg-violet-100 text-violet-700',  border: 'border-violet-200',  },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700',border: 'border-emerald-200', },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700',  border: 'border-orange-200',  },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    badge: 'bg-pink-100 text-pink-700',      border: 'border-pink-200',    },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700',      border: 'border-cyan-200',    },
  gray:    { bg: 'bg-gray-50',    text: 'text-gray-600',    badge: 'bg-gray-100 text-gray-700',      border: 'border-gray-200',    },
  yellow:  { bg: 'bg-yellow-50',  text: 'text-yellow-600',  badge: 'bg-yellow-100 text-yellow-700',  border: 'border-yellow-200',  },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    badge: 'bg-teal-100 text-teal-700',      border: 'border-teal-200',    },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  badge: 'bg-purple-100 text-purple-700',  border: 'border-purple-200',  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700',      border: 'border-rose-200',    },
}

// ── Component ──────────────────────────────────────────────────
const RolePermissions = () => {
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState('teacher')
  const [allGrouped,   setAllGrouped]   = useState({})
  const [checkedIds,   setCheckedIds]   = useState(new Set())
  const [loadingAll,   setLoadingAll]   = useState(true)
  const [loadingRole,  setLoadingRole]  = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [toast,        setToast]        = useState(null)
  const [error,        setError]        = useState(null)

  const originalIdsRef = useRef(new Set())

  const activeRole = ROLES.find((r) => r.id === selectedRole)

  // ── Load all permissions ──
  useEffect(() => {
    ;(async () => {
      try {
        setLoadingAll(true)
        const res     = await rolePermissionService.getAllPermissions()
        // Keys are already normalized to lowercase inside the service
        const grouped = res?.data || {}
        setAllGrouped(grouped)
      } catch {
        setError('Failed to load permissions list.')
      } finally {
        setLoadingAll(false)
      }
    })()
  }, [])

  // ── Load role permissions ──
  const loadRolePerms = useCallback(async (role) => {
    try {
      setLoadingRole(true)
      setError(null)
      const res   = await rolePermissionService.getRolePermissions(role)
      // res.permissionIds is normalized in the service
      const perms = res?.data?.permissions || []
      const ids   = new Set(perms.map((p) => p.permission_id))
      setCheckedIds(ids)
      originalIdsRef.current = new Set(ids)
    } catch {
      setError('Failed to load permissions for this role.')
      setCheckedIds(new Set())
      originalIdsRef.current = new Set()
    } finally {
      setLoadingRole(false)
    }
  }, [])

  useEffect(() => {
    if (!loadingAll) loadRolePerms(selectedRole)
  }, [selectedRole, loadingAll, loadRolePerms])

  const togglePermission = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSection = (sectionPerms) => {
    const ids   = sectionPerms.map((p) => p.permission_id)
    const allOn = ids.every((id) => checkedIds.has(id))
    setCheckedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)))
      return next
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const original = originalIdsRef.current
      const current  = checkedIds
      const toAssign = [...current].filter((id) => !original.has(id))
      const toRemove = [...original].filter((id) => !current.has(id))

      const promises = []
      if (toAssign.length > 0) promises.push(rolePermissionService.assignRolePermissions({ role: selectedRole, permission_ids: toAssign }))
      if (toRemove.length > 0) promises.push(rolePermissionService.removeRolePermission({ role: selectedRole, permission_ids: toRemove }))

      if (promises.length === 0) { showToast('success', 'No changes to save.'); return }

      await Promise.all(promises)
      originalIdsRef.current = new Set(current)
      showToast('success', 'Permissions updated successfully!')
    } catch (err) {
      showToast('error', err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const sections   = Object.entries(allGrouped)
  const totalAll   = sections.reduce((sum, [, p]) => sum + p.length, 0)
  const totalSel   = checkedIds.size
  const original   = originalIdsRef.current
  const toAssign   = [...checkedIds].filter((id) => !original.has(id)).length
  const toRemove   = [...original].filter((id) => !checkedIds.has(id)).length
  const hasChanges = toAssign > 0 || toRemove > 0

  if (loadingAll) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold border backdrop-blur-sm ${
            toast.type === 'success'
              ? 'bg-white/95 border-emerald-200 text-emerald-700'
              : 'bg-white/95 border-red-200 text-red-600'
          }`}
          style={{ animation: 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            : <AlertCircle  className="w-4 h-4 text-red-400 flex-shrink-0"  />
          }
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto py-6 px-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-2 leading-tight">
              Role Permissions
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Control what each role can access in your school system
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm flex-shrink-0">
            <span className="text-amber-500 text-base">🔒</span>
            <span className="text-sm font-bold text-gray-800">{totalSel}</span>
            <span className="text-xs text-gray-400">/ {totalAll} permissions selected</span>
          </div>

          <span className="hidden sm:block text-xs font-bold text-gray-400 tracking-widest uppercase">
            School Admin Control
          </span>
        </div>

        {/* ── Role Selector Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Select Role
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => {
              const Icon     = role.icon
              const isActive = selectedRole === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  disabled={loadingRole || saving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isActive
                      ? `${role.activeBg} text-white ring-2 ring-offset-1 ${role.activeRing} shadow-md`
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 border border-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {role.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Permission Sections ── */}
        {loadingRole ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading permissions...</p>
            </div>
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <ShieldCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No permissions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map(([section, perms]) => {
              const meta       = SECTION_META[section] || { icon: Settings, color: 'gray' }
              const c          = COLORS[meta.color] || COLORS.gray
              const Icon       = meta.icon
              const ids        = perms.map((p) => p.permission_id)
              const allOn      = ids.every((id) => checkedIds.has(id))
              const checkedCnt = ids.filter((id) => checkedIds.has(id)).length
              const progress   = Math.round((checkedCnt / perms.length) * 100)

              return (
                <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                  {/* Section Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${c.text}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm capitalize leading-snug">
                          {section.replace(/_/g, ' ')} Management
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400">
                            {checkedCnt} / {perms.length} permissions selected
                          </p>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${c.text.replace('text-', 'bg-')}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSection(perms)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                        ${allOn
                          ? `${c.badge} ${c.border}`
                          : `bg-white ${c.border} text-gray-500 hover:${c.bg}`
                        }`}
                    >
                      {allOn
                        ? <CheckSquare className="w-3.5 h-3.5" />
                        : <Square      className="w-3.5 h-3.5" />
                      }
                      {allOn ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {/* Permission Rows */}
                  <div className="divide-y divide-gray-50">
                    {perms.map((perm) => {
                      const checked   = checkedIds.has(perm.permission_id)
                      const wasOrig   = originalIdsRef.current.has(perm.permission_id)
                      const isNew     = checked && !wasOrig
                      const isRemoved = !checked && wasOrig

                      return (
                        <label
                          key={perm.permission_id}
                          className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all duration-150
                            ${isNew     ? 'bg-emerald-50 border-l-4 border-l-emerald-400'
                            : isRemoved ? 'bg-red-50 border-l-4 border-l-red-400'
                            : checked   ? 'bg-gray-50/60'
                            : 'hover:bg-gray-50/50'
                            }`}
                        >
                          {/* Custom Checkbox */}
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all duration-150
                            ${isNew     ? 'bg-emerald-500 border-emerald-500'
                            : isRemoved ? 'border-red-300 bg-white'
                            : checked   ? `${activeRole?.activeBg || 'bg-blue-600'} border-transparent`
                            : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            {(checked && !isRemoved) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {isRemoved && (
                              <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(perm.permission_id)}
                              className="sr-only"
                            />
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-snug
                              ${isNew     ? 'text-emerald-700'
                              : isRemoved ? 'text-red-400 line-through'
                              : checked   ? 'text-gray-900'
                              : 'text-gray-600'
                              }`}
                            >
                              {perm.key}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{perm.description}</p>
                            )}
                          </div>

                          {/* Change Badge */}
                          {isNew && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md flex-shrink-0 border border-emerald-200">
                              +ADD
                            </span>
                          )}
                          {isRemoved && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-md flex-shrink-0 border border-red-200">
                              −REM
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Save Bar ── */}
        {!loadingRole && sections.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <div>
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{totalSel}</span> permissions for{' '}
                <span className={`font-bold capitalize ${activeRole ? activeRole.activeBg.replace('bg-', 'text-') : 'text-gray-900'}`}>
                  {selectedRole}
                </span>
              </p>
              {hasChanges ? (
                <p className="text-xs mt-0.5">
                  {toAssign > 0 && <span className="text-emerald-600 font-semibold">+{toAssign} to add </span>}
                  {toRemove > 0 && <span className="text-red-500 font-semibold">−{toRemove} to remove</span>}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">No unsaved changes</p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                bg-gradient-to-r ${activeRole?.gradient || 'from-blue-500 to-blue-700'}
                hover:shadow-lg hover:scale-[1.02] active:scale-100`}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> {hasChanges ? 'Save Changes' : 'No Changes'}</>
              }
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  )
}

export default RolePermissions