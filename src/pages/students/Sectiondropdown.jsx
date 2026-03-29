import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Layers, Users } from 'lucide-react'

/**
 * SectionDropdown — Custom rich dropdown for section selection.
 *
 * DATA CONTRACT (from API):
 *   { section_id, class_id, section_name, capacity, current_students, display_name, full }
 *
 * UI shows   → display_name   "A3 (0/45) - Vacant"   (never saved)
 * DB saves   → section_id     134                     (required by backend)
 *
 * Props:
 *   sections    — raw API section objects array
 *   value       — selected section_id (number or string)
 *   onChange    — fn(section_id, section_name) — section_id goes to DB
 *   disabled    — boolean
 *   loading     — boolean
 *   placeholder — string
 */
export function SectionDropdown({ sections = [], value, onChange, disabled, loading, placeholder }) {
  const [open, setOpen]             = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef   = useRef(null)
  const containerRef = useRef(null)

  // Match selected section by section_id
  const selected = sections.find(s => String(s.section_id) === String(value)) || null

  // Calculate fixed position from trigger rect
  const calcStyle = () => {
    if (!triggerRef.current) return {}
    const rect = triggerRef.current.getBoundingClientRect()
    return {
      position: 'fixed',
      top:   rect.bottom + 4,
      left:  rect.left,
      width: rect.width,
      zIndex: 9999,
    }
  }

  const openDropdown = () => {
    if (disabled || loading) return
    setDropdownStyle(calcStyle())
    setOpen(o => !o)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      const portal = document.querySelector('[data-secdrop-portal]')
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !(portal && portal.contains(e.target))
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return
    const update = () => setDropdownStyle(calcStyle())
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  const handleSelect = (sec) => {
    // ✅ Passes section_id (required by backend) + section_name (for reference)
    // ❌ display_name is NEVER passed — it's UI-only
    onChange(sec.section_id, sec.section_name)
    setOpen(false)
  }

  const getStatusBadge = (sec) => {
    if (sec.full) return { label: 'FULL', bg: 'bg-red-100', text: 'text-red-700' }
    const fill = sec.capacity > 0 ? sec.current_students / sec.capacity : 0
    if (fill >= 0.85) return { label: 'FILLING FAST', bg: 'bg-orange-100', text: 'text-orange-700' }
    return { label: 'VACANT', bg: 'bg-green-100', text: 'text-green-700' }
  }

  return (
    <div ref={containerRef} className="relative w-full">

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        disabled={disabled || loading}
        className={[
          'w-full flex items-center justify-between gap-2',
          'pl-10 pr-3 py-2.5 text-sm text-left',
          'bg-gray-50 border rounded-lg outline-none transition-all',
          open ? 'border-blue-500 ring-2 ring-blue-500 bg-white' : 'border-gray-200',
          disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400',
        ].join(' ')}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Layers className="w-4 h-4 text-gray-400" />
        </span>

        {loading ? (
          <span className="flex items-center gap-2 text-gray-400">
            <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full inline-block animate-spin" />
            Loading sections...
          </span>
        ) : selected ? (
          /* Show display_name in trigger — only for UI rendering */
          <span className="font-semibold text-gray-900 truncate">
            {selected.display_name || selected.section_name}
          </span>
        ) : (
          <span className="text-gray-400">
            {placeholder || (!sections.length ? 'No sections available' : 'Select Section')}
          </span>
        )}

        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown — fixed position so it escapes grid overflow/clipping */}
      {open && (
        <div
          data-secdrop-portal="true"
          style={dropdownStyle}
          className="bg-white border border-blue-200 rounded-xl shadow-2xl overflow-hidden"
        >
          {sections.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No sections available for this class
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
              {sections.map((sec) => {
                const badge      = getStatusBadge(sec)
                const isSelected = String(sec.section_id) === String(value)
                const fillPct    = sec.capacity > 0
                  ? Math.min(100, Math.round((sec.current_students / sec.capacity) * 100))
                  : 0

                return (
                  <button
                    key={sec.section_id}
                    type="button"
                    onClick={() => handleSelect(sec)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-900">{sec.section_name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="w-3 h-3" />
                          {sec.current_students}/{sec.capacity}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sec.full ? 'bg-red-400' : fillPct >= 85 ? 'bg-orange-400' : 'bg-green-400'}`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{fillPct}%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Status: {sec.full ? 'Full' : fillPct >= 85 ? 'Filling Fast' : 'Vacant'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}