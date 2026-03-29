import { useState, useEffect, useRef } from 'react'
import {
  Bell, Search, LogOut, Menu, ChevronDown,
  Settings, HelpCircle, User, Shield, Inbox, X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PERMISSIONS as P } from '../config/permissions.js'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const getInitials = (name) => {
  if (!name) return 'A'
  return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
}

const getAvatarGradient = (name) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-rose-500',
    'from-pink-500 to-fuchsia-600',
  ]

  if (!name) return gradients[0]
  return gradients[name.charCodeAt(0) % gradients.length]
}

const formatTime = (date) => {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  const diff = Date.now() - parsed.getTime()
  const mins = Math.floor(diff / 60000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`

  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`

  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const NotifDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const recent = notifications.slice(0, 5)

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
    } catch {
      // ignore
    }
  }

  const handleItemClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id)
      } catch {
        // ignore
      }
    }

    onClose()
    navigate('/admin/my-notifications')
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          recent.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleItemClick(notification)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                !notification.read ? 'bg-orange-50/40' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                    !notification.read ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {(notification.senderName || 'S').charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notification.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                </div>

                {!notification.read && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => {
            onClose()
            navigate('/admin/my-notifications')
          }}
          className="w-full text-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          View all notifications →
        </button>
      </div>
    </div>
  )
}

const Navbar = ({ onMenuClick, isCollapsed }) => {
  const { logout, user, hasPermission } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [bellPulse, setBellPulse] = useState(false)

  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    if (unreadCount > 0) {
      setBellPulse(true)
      const timer = setTimeout(() => setBellPulse(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  useEffect(() => {
    const handler = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    logout()
    navigate('/login')
  }

  const initials = getInitials(user?.name)
  const avatarGradient = getAvatarGradient(user?.name)
  const canAccessSettings =
    user?.role === 'school_admin' && hasPermission(P.MANAGE_PERMISSIONS)

  return (
    <nav
      className={`bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3 fixed top-0 left-0 ${
        isCollapsed ? 'lg:left-[72px]' : 'lg:left-64'
      } right-0 z-30 transition-all duration-300 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-1">
            <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">
              {user?.role === 'school_admin' && 'Admin Dashboard'}
              {user?.role === 'teacher' && 'Teacher Dashboard'}
              {user?.role === 'accountant' && 'Accounts Dashboard'}
            </h1>
            <p className="text-xs text-gray-400 hidden md:block">
              {user?.role === 'school_admin' && 'Manage your school efficiently'}
              {user?.role === 'teacher' && 'Manage your classes and students'}
              {user?.role === 'accountant' && 'Manage finances and accounts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Search className="w-5 h-5 text-gray-500" />
          </button>

          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setIsNotifOpen((prev) => !prev)
                setIsUserMenuOpen(false)
              }}
              title="Notifications"
              className={`relative p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 ${
                bellPulse ? 'scale-110' : 'scale-100'
              }`}
            >
              <Bell
                className={`w-5 h-5 transition-colors duration-200 ${
                  unreadCount > 0 ? 'text-orange-500' : 'text-gray-500'
                }`}
              />
              {unreadCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white ${
                    bellPulse ? 'animate-bounce' : ''
                  }`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && <NotifDropdown onClose={() => setIsNotifOpen(false)} />}
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1" />

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen)
                setIsNotifOpen(false)
              }}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                isUserMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-md flex-shrink-0`}
              >
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-gray-400 capitalize leading-tight">
                  {user?.role?.replace('_', ' ') || 'School Admin'}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                style={{ animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
              >
                <div className="relative px-4 py-4 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${avatarGradient} opacity-10`} />
                  <div className="relative flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <span className="text-white text-base font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {user?.name || 'Administrator'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || 'admin@school.com'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="text-[11px] text-blue-600 font-semibold capitalize">
                          {user?.role?.replace('_', ' ') || 'School Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 mx-3" />

                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      navigate('/admin/profile')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      navigate('/admin/my-notifications')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors relative">
                      <Inbox className="w-4 h-4 text-orange-500" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">My Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {canAccessSettings && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        navigate('/admin/settings/role-permissions')
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                        <Settings className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="font-medium">Settings</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="font-medium">Help & Support</span>
                  </button>
                </div>

                <div className="h-px bg-gray-100 mx-3" />

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
