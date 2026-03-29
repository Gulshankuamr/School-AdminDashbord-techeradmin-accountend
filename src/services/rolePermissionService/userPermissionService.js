// import { API_BASE_URL, getAuthToken } from '../api'

// export const userPermissionService = {

//   // ===============================
//   // 1️⃣ GET USERS BY ROLE
//   // ===============================
//   getUsersByRole: async (role) => {
//     const token = getAuthToken()
//     if (!token) throw new Error('Token missing')
//     if (!role)  throw new Error('role is required')

//     const response = await fetch(
//       `${API_BASE_URL}/schooladmin/getUsersByRole/${role}`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )

//     const data = await response.json()

//     if (!response.ok || data.success !== true) {
//       throw new Error(data?.message || 'Failed to fetch users')
//     }

//     return data
//     // Response shape:
//     // {
//     //   success: true,
//     //   data: [{ user_id: 360, name: "GULSHAN KUMAR", user_email: "...", student_id: 217 }]
//     // }
//   },

//   // ===============================
//   // 2️⃣ GET USER PERMISSIONS (overrides only)
//   // ===============================
//   getUserPermissions: async (userId) => {
//     const token = getAuthToken()
//     if (!token) throw new Error('Token missing')
//     if (!userId) throw new Error('userId is required')

//     const response = await fetch(
//       `${API_BASE_URL}/schooladmin/getUserPermissions/${userId}/permissions`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )

//     const data = await response.json()

//     if (!response.ok || data.success !== true) {
//       throw new Error(data?.message || 'Failed to fetch user permissions')
//     }

//     return data
//     // Response shape:
//     // {
//     //   success: true,
//     //   allowedPermissionIds: [1, 3, 5],
//     //   deniedPermissionIds:  [2, 4],
//     //   lastSaved: "2024-01-15T10:30:00Z"
//     // }
//   },

//   // ===============================
//   // 3️⃣ SAVE USER PERMISSIONS
//   // ===============================
//   saveUserPermissions: async ({ userId, allowedPermissionIds, deniedPermissionIds }) => {
//     const token = getAuthToken()
//     if (!token) throw new Error('Token missing')
//     if (!userId)                              throw new Error('userId is required')
//     if (!Array.isArray(allowedPermissionIds)) throw new Error('allowedPermissionIds must be an array')
//     if (!Array.isArray(deniedPermissionIds))  throw new Error('deniedPermissionIds must be an array')

//     // Guard: a permission cannot be both allowed and denied
//     const conflict = allowedPermissionIds.find((id) => deniedPermissionIds.includes(id))
//     if (conflict) throw new Error(`Permission "${conflict}" cannot be both allowed and denied.`)

//     const response = await fetch(
//       `${API_BASE_URL}/schooladmin/saveUserPermissions`,
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           user_id: Number(userId),
//           permissions: [
//             ...allowedPermissionIds.map((id) => ({
//               permission_id: Number(id),
//               state: 'allowed',
//             })),
//             ...deniedPermissionIds.map((id) => ({
//               permission_id: Number(id),
//               state: 'denied',
//             })),
//           ],
//         }),
//       }
//     )

//     const data = await response.json()

//     if (!response.ok || data.success !== true) {
//       throw new Error(data?.message || 'Failed to save user permissions')
//     }

//     return data
//     // Payload sent:
//     // {
//     //   user_id: 12,
//     //   permissions: [
//     //     { permission_id: 1, state: "allowed" },
//     //     { permission_id: 2, state: "denied"  }
//     //   ]
//     // }
//   },
// }



import { API_BASE_URL, getAuthToken } from '../api'

export const userPermissionService = {

  // ===============================
  // 1️⃣ GET USERS BY ROLE
  // ===============================
  getUsersByRole: async (role) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    if (!role)  throw new Error('role is required')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getUsersByRole/${role}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await response.json()
    if (!response.ok || data.success !== true)
      throw new Error(data?.message || 'Failed to fetch users')
    return data
  },

  // ===============================
  // 2️⃣ GET USER PERMISSIONS
  // ===============================
  getUserPermissions: async (userId) => {
    const token = getAuthToken()
    if (!token)  throw new Error('Token missing')
    if (!userId) throw new Error('userId is required')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getUserPermissions/${userId}/permissions`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await response.json()
    if (!response.ok || data.success !== true)
      throw new Error(data?.message || 'Failed to fetch user permissions')
    return data
    // Response shape:
    // {
    //   success: true,
    //   allowedPermissionIds: [1, 3, 5],
    //   deniedPermissionIds:  [2, 4],
    //   lastSaved: "2024-01-15T10:30:00Z"
    // }
  },

  // ===============================
  // 3️⃣ SAVE USER PERMISSIONS
  // ✅ Now includes 'default' state too
  // ===============================
  saveUserPermissions: async ({ userId, allowedPermissionIds, deniedPermissionIds, defaultPermissionIds = [] }) => {
    const token = getAuthToken()
    if (!token)  throw new Error('Token missing')
    if (!userId) throw new Error('userId is required')
    if (!Array.isArray(allowedPermissionIds))  throw new Error('allowedPermissionIds must be an array')
    if (!Array.isArray(deniedPermissionIds))   throw new Error('deniedPermissionIds must be an array')
    if (!Array.isArray(defaultPermissionIds))  throw new Error('defaultPermissionIds must be an array')

    // Guard: a permission cannot be in two states at once
    const allIds    = [...allowedPermissionIds, ...deniedPermissionIds, ...defaultPermissionIds]
    const uniqueIds = new Set(allIds)
    if (uniqueIds.size !== allIds.length)
      throw new Error('A permission cannot have more than one state.')

    const permissions = [
      ...allowedPermissionIds.map((id) => ({ permission_id: Number(id), state: 'allowed'  })),
      ...deniedPermissionIds.map( (id) => ({ permission_id: Number(id), state: 'denied'   })),
      ...defaultPermissionIds.map((id) => ({ permission_id: Number(id), state: 'default'  })),
    ]

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/saveUserPermissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: Number(userId),
          permissions,
        }),
      }
    )
    const data = await response.json()
    if (!response.ok || data.success !== true)
      throw new Error(data?.message || 'Failed to save user permissions')
    return data
  },
}