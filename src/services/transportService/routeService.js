import { API_BASE_URL, getAuthToken } from "../api"

export const routeService = {

  // ── GET ALL ROUTES ────────────────────────────────────────────────────────
  getRoutes: async () => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/getRoutes`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch routes')
    return data.data || []
  },

  // ── CREATE ROUTE ──────────────────────────────────────────────────────────
  createRoute: async (payload) => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/createRoute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        route_name:   payload.route_name,    // required
        vehicle_no:   payload.vehicle_no   || undefined,
        driver_name:  payload.driver_name  || undefined,
        driver_phone: payload.driver_phone || undefined,
      }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to create route')
    return data
  },

  // ── UPDATE ROUTE ──────────────────────────────────────────────────────────
  updateRoute: async (payload) => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/updateRoute`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        transport_route_id: payload.transport_route_id,  // required
        route_name:         payload.route_name   || undefined,
        vehicle_no:         payload.vehicle_no   || undefined,
        driver_name:        payload.driver_name  || undefined,
        driver_phone:       payload.driver_phone || undefined,
      }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update route')
    return data
  },

  // ── DELETE ROUTE ──────────────────────────────────────────────────────────
  deleteRoute: async (id) => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/deleteRoute`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ transport_route_id: id }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete route')
    return data
  },
}