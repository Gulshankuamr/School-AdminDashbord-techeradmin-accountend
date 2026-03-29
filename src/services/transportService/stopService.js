import { API_BASE_URL, getAuthToken } from "../api"

export const stopService = {

  // ── GET ALL FEE HEADS ─────────────────────────────────────────────────────
  // GET /api/schooladmin/getAllFeeHeads
  // Response: { success, data: { count, fee_heads: [ { fee_head_id, head_name, ... } ] } }
  getFeeHeads: async () => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/getAllFeeHeads`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch fee heads')
    // API returns data.data.fee_heads[]
    return data.data?.fee_heads || []
  },

  // ── GET STOPS (by route) ──────────────────────────────────────────────────
  // GET /api/schooladmin/getStops?transport_route_id=2
  getStops: async (routeId) => {
    const token = getAuthToken()
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getStops?transport_route_id=${routeId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch stops')
    return data.data || []
  },

  // ── CREATE STOP ───────────────────────────────────────────────────────────
  // POST /api/schooladmin/createStop
  createStop: async (payload) => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/createStop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        transport_route_id: payload.transport_route_id,  // required
        stop_name:          payload.stop_name,            // required
        distance_km:        payload.distance_km,          // required
        base_amount:        payload.base_amount,          // required
        fee_frequency:      payload.fee_frequency,        // required
        fee_head_id:        payload.fee_head_id,          // required
      }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to create stop')
    return data
  },

  // ── UPDATE STOP ───────────────────────────────────────────────────────────
  // PUT /api/schooladmin/updateStop
  updateStop: async (payload) => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/updateStop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        transport_route_stop_id: payload.transport_route_stop_id,  // required
        stop_name:               payload.stop_name    || undefined,
        distance_km:             payload.distance_km  ?? undefined,
        base_amount:             payload.base_amount  ?? undefined,
        fee_frequency:           payload.fee_frequency || undefined,
      }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update stop')
    return data
  },

  // ── DELETE STOP ───────────────────────────────────────────────────────────
  // DELETE /api/schooladmin/deleteStop
  deleteStop: async (id) => {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/schooladmin/deleteStop`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ transport_route_stop_id: id }),
    })
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete stop')
    return data
  },
}