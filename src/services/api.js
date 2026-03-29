// src/services/api.js
const API_BASE_URL = 'https://university.fctesting.shop/api'

// Read token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token') || null

// Small wrapper around fetch to attach token and handle 401
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const isFormData = options.body instanceof FormData

  const config = {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  return response
}

export { API_BASE_URL, getAuthToken }

/**
 * GET REQUEST
 */
export const get = async (endpoint) => {
  const response = await apiFetch(endpoint, { method: 'GET' })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

/**
 * POST REQUEST (JSON)
 */
export const post = async (endpoint, data) => {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

/**
 * POST REQUEST (FormData)
 * For file uploads and multipart/form-data
 */
export const postFormData = async (endpoint, formData) => {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

/**
 * PUT REQUEST
 */
export const put = async (endpoint, data) => {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

/**
 * DELETE REQUEST
 */
export const del = async (endpoint) => {
  const response = await apiFetch(endpoint, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return await response.json()
}

// Export all methods as default
export default {
  get,
  post,
  postFormData,
  put,
  delete: del,
}

