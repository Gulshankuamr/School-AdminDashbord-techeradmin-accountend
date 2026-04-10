// src/components/common/PermissionGuard.jsx
//
// Kisi bhi element/button ko permission se guard karta hai.
// Permission nahi hai to sirf null return karta hai —
// element DOM mein bhi nahi aata.
//
// Props:
//   permission  — single permission string  (any one)
//   anyOf       — array of permissions      (inme se koi bhi ek ho toh show karo)
//   allOf       — array of permissions      (yeh saari honI chahiye tab show karo)
//
// Usage:
//   <PermissionGuard permission={PERMISSIONS.ADD_STUDENT}>
//     <button>Add Student</button>
//   </PermissionGuard>
//
//   <PermissionGuard anyOf={[PERMISSIONS.EDIT_EXAM, PERMISSIONS.MANAGE_EXAM_MARKS]}>
//     <button>Edit</button>
//   </PermissionGuard>
//
//   <PermissionGuard allOf={[PERMISSIONS.MANAGE_FEES, PERMISSIONS.VIEW_FEES]}>
//     <button>Manage Fees</button>
//   </PermissionGuard>

import { useAuth } from '../../context/AuthContext'

function PermissionGuard({ children, permission, anyOf, allOf }) {
  const { can, canAny, canAll } = useAuth()

  if (permission && !can(permission))   return null
  if (anyOf?.length && !canAny(anyOf)) return null
  if (allOf?.length && !canAll(allOf)) return null

  return children
}

export default PermissionGuard