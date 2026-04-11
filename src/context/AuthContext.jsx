// import { createContext, useContext, useEffect, useState } from 'react'
// import { authService } from '../services/authService'
// import { mapPermissions } from '../config/permissions.js'

// const AuthContext = createContext(null)

// const matchesPermission = (userPermissions, permission) => {
//   if (!permission) return true
//   if (Array.isArray(permission)) {
//     return permission.some((key) => userPermissions.includes(key))
//   }
//   return userPermissions.includes(permission)
// }

// export function AuthProvider({ children }) {
//   const [isLoading, setIsLoading] = useState(true)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState(null)
//   const [permissions, setPermissions] = useState([])

//   useEffect(() => {
//     const token = localStorage.getItem('auth_token')
//     const rawUser = localStorage.getItem('user')
//     const rawPermissions = localStorage.getItem('permissions')

//     if (token) {
//       setIsLoggedIn(true)

//       try {
//         if (rawUser) setUser(JSON.parse(rawUser))
//       } catch {
//         setUser(null)
//       }

//       try {
//         if (rawPermissions) setPermissions(JSON.parse(rawPermissions))
//       } catch {
//         setPermissions([])
//       }
//     }

//     setIsLoading(false)
//   }, [])

//   const login = async (email, password) => {
//     try {
//       setIsLoading(true)
//       const result = await authService.login(email, password)

//       if (result?.success && result?.data?.token) {
//         const userData = result.data.user
//         const nextPermissions = mapPermissions(userData?.permissions || [])

//         localStorage.setItem('permissions', JSON.stringify(nextPermissions))

//         setUser(userData)
//         setPermissions(nextPermissions)
//         setIsLoggedIn(true)

        

//         return { success: true }
//       }

//       setIsLoggedIn(false)
//       setUser(null)
//       setPermissions([])

//       return {
//         success: false,
//         message: result?.message || 'Login failed. Please try again.',
//       }
//     } catch (error) {
//       console.error('AuthContext login error:', error)
//       return { success: false, message: 'Unexpected error. Please try again.' }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const logout = async () => {
//     await authService.logout()
//     setIsLoggedIn(false)
//     setUser(null)
//     setPermissions([])
//   }

//   const can = (permission) => {
//     if (!permission) return true
//     if (user?.role === 'school_admin') return true
//     return matchesPermission(permissions, permission)
//   }

//   const canAny = (permissionList = []) => {
//     if (!permissionList.length) return true
//     if (user?.role === 'school_admin') return true
//     return permissionList.some((permission) => matchesPermission(permissions, permission))
//   }

//   const canAll = (permissionList = []) => {
//     if (!permissionList.length) return true
//     if (user?.role === 'school_admin') return true
//     return permissionList.every((permission) => matchesPermission(permissions, permission))
//   }

//   const isRole = (role) => {
//     if (!user?.role) return false
//     if (Array.isArray(role)) return role.includes(user.role)
//     return user.role === role
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         isLoggedIn,
//         isLoading,
//         user,
//         permissions,
//         login,
//         logout,
//         can,
//         canAny,
//         canAll,
//         isRole,
//         hasPermission: can,
//         hasAnyPermission: canAny,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
//   return context
// }




import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { mapPermissions } from '../config/permissions.js'

const AuthContext = createContext(null)

const matchesPermission = (userPermissions, permission) => {
  if (!permission) return true
  if (Array.isArray(permission)) {
    return permission.some((key) => userPermissions.includes(key))
  }
  return userPermissions.includes(permission)
}

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const rawUser = localStorage.getItem('user')
    const rawPermissions = localStorage.getItem('permissions')

    if (token) {
      setIsLoggedIn(true)

      try {
        if (rawUser) setUser(JSON.parse(rawUser))
      } catch {
        setUser(null)
      }

      try {
        if (rawPermissions) setPermissions(JSON.parse(rawPermissions))
      } catch {
        setPermissions([])
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const result = await authService.login(email, password)

      if (result?.success && result?.data?.token) {
        const userData = result.data.user
        const nextPermissions = mapPermissions(userData?.permissions || [])

        localStorage.setItem('permissions', JSON.stringify(nextPermissions))

        setUser(userData)
        setPermissions(nextPermissions)
        setIsLoggedIn(true)

        // 🔥 FCM Token: login success ke baad generate + save karo
        // Dynamic import use kiya — login slow nahi hoga
        try {
          const { generateToken } = await import('../config/firebaseConfig')
          const { notificationService } = await import('../services/notificationService/notificationService')
          const fcmToken = await generateToken()
          if (fcmToken) {
            await notificationService.saveFcmToken(fcmToken)
            console.log('✅ FCM token saved')
          }
        } catch (fcmErr) {
          // FCM fail hone se login nahi rukna chahiye — silently ignore
          console.warn('⚠️ FCM setup failed (non-critical):', fcmErr)
        }

        return { success: true }
      }

      setIsLoggedIn(false)
      setUser(null)
      setPermissions([])

      return {
        success: false,
        message: result?.message || 'Login failed. Please try again.',
      }
    } catch (error) {
      console.error('AuthContext login error:', error)
      return { success: false, message: 'Unexpected error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    setIsLoggedIn(false)
    setUser(null)
    setPermissions([])
  }

  const can = (permission) => {
    if (!permission) return true
    if (user?.role === 'school_admin') return true
    return matchesPermission(permissions, permission)
  }

  const canAny = (permissionList = []) => {
    if (!permissionList.length) return true
    if (user?.role === 'school_admin') return true
    return permissionList.some((permission) => matchesPermission(permissions, permission))
  }

  const canAll = (permissionList = []) => {
    if (!permissionList.length) return true
    if (user?.role === 'school_admin') return true
    return permissionList.every((permission) => matchesPermission(permissions, permission))
  }

  const isRole = (role) => {
    if (!user?.role) return false
    if (Array.isArray(role)) return role.includes(user.role)
    return user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        permissions,
        login,
        logout,
        can,
        canAny,
        canAll,
        isRole,
        hasPermission: can,
        hasAnyPermission: canAny,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}