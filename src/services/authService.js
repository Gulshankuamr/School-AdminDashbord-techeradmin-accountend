import { API_BASE_URL } from './api'

const ALLOWED_LOGIN_ROLES = ['school_admin', 'teacher', 'accountant']

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Login failed. Please check your credentials.',
        }
      }

      const token = data?.data?.token
      const userObj = data?.data?.user
      const permissions = userObj?.permissions || []

      if (!ALLOWED_LOGIN_ROLES.includes(userObj?.role)) {
        return {
          success: false,
          message: 'Access denied. Only admin, teacher, or accountant can login here.',
        }
      }

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userObj))
      localStorage.setItem('permissions', JSON.stringify(permissions))

      return {
        success: true,
        data: {
          token,
          user: userObj,
        },
      }
    } catch (error) {
      console.error('Login API Error:', error)
      return {
        success: false,
        message: 'Network error. Check your connection and try again.',
      }
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {})
      }
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  getToken: () => localStorage.getItem('auth_token') || null,

  getPermissions: () => {
    try {
      const permissions = localStorage.getItem('permissions')
      return permissions ? JSON.parse(permissions) : []
    } catch {
      return []
    }
  },
}
