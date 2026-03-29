import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, ChevronDown, Menu, GraduationCap } from 'lucide-react'
import { sidebarMenuItems } from '../config/sidebarConfig'
import { useAuth } from '../context/AuthContext'

const COLORS = {
  primary: 'text-blue-600',
  primaryLight: 'text-blue-400',
  muted: 'text-gray-400',
  mutedLight: 'text-gray-300',
  divider: 'border-gray-100',
}

const Sidebar = ({ isOpen, onClose, onToggleCollapse, isCollapsed }) => {
  const location = useLocation()
  const { hasPermission, user } = useAuth()

  const [openDropdowns, setOpenDropdowns] = useState({})
  const [openGroups, setOpenGroups] = useState({})
  const [hoveredItem, setHoveredItem] = useState(null)
  const [hoverTimeout, setHoverTimeout] = useState(null)

  const isAdmin = user?.role === 'school_admin'

  const canSee = (item) => {
    if (!item) return false
    if (item.adminOnly && !isAdmin) return false
    return hasPermission(item.permission ?? null)
  }

  const visibleSubs = (subs = []) => subs.filter((sub) => canSee(sub))

  const canSeeItem = (item) => {
    if (!canSee(item)) return false
    if (!item.hasDropdown) return true
    return visibleSubs(item.subItems ?? []).length > 0
  }

  const canSeeGroup = (group) => group.items.some((item) => canSeeItem(item))

  useEffect(() => {
    const dropdownState = {}
    const groupState = {}

    sidebarMenuItems.forEach((entry) => {
      if (!entry.isGroup) return

      entry.items.filter(canSeeItem).forEach((item) => {
        const subs = visibleSubs(item.subItems ?? [])
        const hit = subs.some(
          (sub) => sub.path === location.pathname || location.pathname.startsWith(sub.path)
        )

        if (hit || item.path === location.pathname) {
          if (hit) dropdownState[item.id] = true
          groupState[entry.id] = true
        }
      })
    })

    setOpenDropdowns(dropdownState)
    setOpenGroups((prev) => ({ ...prev, ...groupState }))
  }, [location.pathname])

  const toggleDropdown = (id) =>
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleHover = (id) => {
    if (!isCollapsed) return
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setHoveredItem(id)
  }

  const handleLeave = () => {
    if (!isCollapsed) return
    setHoverTimeout(setTimeout(() => setHoveredItem(null), 200))
  }

  const isGroupActive = (items) =>
    items.filter(canSeeItem).some((item) => {
      if (item.path === location.pathname) return true
      return visibleSubs(item.subItems ?? []).some(
        (sub) => sub.path === location.pathname || location.pathname.startsWith(sub.path)
      )
    })

  const renderItem = (item) => {
    if (!canSeeItem(item)) return null

    const Icon = item.icon
    const isDropOpen = openDropdowns[item.id] || false
    const filteredSubs = visibleSubs(item.subItems ?? [])
    const isActive =
      item.path === location.pathname ||
      filteredSubs.some(
        (sub) => sub.path === location.pathname || location.pathname.startsWith(sub.path)
      )
    const isHovered = hoveredItem === item.id

    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => handleHover(item.id)}
        onMouseLeave={handleLeave}
      >
        {item.hasDropdown && filteredSubs.length > 0 ? (
          <>
            <button
              onClick={() => toggleDropdown(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isCollapsed ? 'justify-center' : 'justify-between'}
                ${isActive ? COLORS.primary : `${COLORS.muted} hover:text-gray-600`}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? COLORS.primaryLight : COLORS.mutedLight}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200
                  ${isDropOpen ? 'rotate-180' : ''} ${COLORS.mutedLight}`} />
              )}
            </button>

            {!isCollapsed && isDropOpen && (
              <div className="ml-4 mt-1 pl-3 space-y-1 mb-2">
                {filteredSubs.map((sub) => {
                  const subActive = sub.path === location.pathname
                  return (
                    <NavLink
                      key={sub.id || sub.path}
                      to={sub.path}
                      onClick={onClose}
                      className={({ isActive: navActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors
                        ${navActive || subActive ? COLORS.primary : `${COLORS.muted} hover:text-gray-600`}`
                      }
                    >
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${subActive ? 'bg-blue-400' : 'bg-gray-300'}`} />
                      {sub.label}
                    </NavLink>
                  )
                })}
              </div>
            )}

            {isCollapsed && isHovered && (
              <div
                className="absolute left-full top-0 ml-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                style={{ animation: 'flyoutIn 0.15s ease-out both' }}
                onMouseEnter={() => handleHover(item.id)}
                onMouseLeave={handleLeave}
              >
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="font-medium text-sm text-gray-700">{item.label}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {filteredSubs.map((sub) => {
                    const subActive = sub.path === location.pathname
                    return (
                      <NavLink
                        key={sub.id || sub.path}
                        to={sub.path}
                        onClick={onClose}
                        className={({ isActive: navActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                          ${navActive || subActive ? COLORS.primary : 'text-gray-500 hover:text-gray-800'}`
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${subActive ? 'bg-blue-400' : 'bg-gray-300'}`} />
                        {sub.label}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : !item.hasDropdown ? (
          <NavLink
            to={item.path}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150
              ${isCollapsed ? 'justify-center' : ''}
              ${isActive ? COLORS.primary : `${COLORS.muted} hover:text-gray-600`}`
            }
          >
            <Icon className={`w-[17px] h-[17px] flex-shrink-0
              ${location.pathname === item.path ? COLORS.primaryLight : COLORS.mutedLight}`} />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ) : null}
      </div>
    )
  }

  const renderGroup = (group) => {
    if (!canSeeGroup(group)) return null

    const GroupIcon = group.icon
    const expanded = openGroups[group.id] !== false
    const active = isGroupActive(group.items)

    return (
      <div key={group.id} className="mt-4 first:mt-0">
        {!isCollapsed && expanded && (
          <div className="px-3 mb-1 flex items-center gap-2">
            <GroupIcon className={`w-3.5 h-3.5 ${active ? COLORS.primaryLight : COLORS.mutedLight}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider
              ${active ? COLORS.primary : COLORS.muted}`}>
              {group.label}
            </span>
          </div>
        )}

        {(expanded || isCollapsed) && (
          <div className="space-y-0.5">
            {group.items.map((item) => renderItem(item))}
          </div>
        )}

        {!isCollapsed && <div className={`border-t ${COLORS.divider} mt-4`} />}
      </div>
    )
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50
        transition-all duration-300 overflow-y-auto flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-[72px]' : 'w-64'}
        lg:translate-x-0
      `}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100
          sticky top-0 bg-white z-10 ${isCollapsed ? 'flex-col py-4' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="text-white w-5 h-5" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-gray-800 text-sm leading-tight whitespace-nowrap">SchoolPro</p>
              <p className="text-xs text-gray-400 whitespace-nowrap">Admin Panel</p>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand' : 'Collapse'}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md
              text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="lg:hidden ml-auto w-7 h-7 flex items-center justify-center
              rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {sidebarMenuItems.map((entry) =>
            entry.isGroup ? renderGroup(entry) : renderItem(entry)
          )}
        </nav>
      </aside>

      <style>{`
        @keyframes flyoutIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

export default Sidebar
