// src/services/profileService.js
import api from './api'

export const getProfile = () => {
  return api.get('/profile')
}

export const createProfile = (data) => {
  return api.post('/profile', data)
}

export const updateProfile = (id, data) => {
  return api.put(`/profile/${id}`, data)
}
