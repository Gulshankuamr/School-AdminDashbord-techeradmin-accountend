// src/components/common/PermissionButton.jsx
//
// Permission-aware button.
// Agar permission nahi hai to render hi nahi hota — DOM mein bhi nahi.
// Saare normal button props (onClick, className, disabled, type, etc.) pass ho jaate hain.
//
// Props:
//   permission  — single permission string  (any one)
//   anyOf       — array of permissions      (inme se koi bhi ek ho toh show karo)
//   allOf       — array of permissions      (yeh saari honI chahiye tab show karo)
//   ...props    — baaki saare normal <button> props
//
// Usage:
//   <PermissionButton
//     permission={PERMISSIONS.ADD_STUDENT}
//     onClick={handleAdd}
//     className="btn btn-primary"
//   >
//     + Add Student
//   </PermissionButton>
//
//   <PermissionButton
//     anyOf={[PERMISSIONS.EDIT_EXAM, PERMISSIONS.MANAGE_EXAM_MARKS]}
//     onClick={() => handleEdit(id)}
//   >
//     Edit
//   </PermissionButton>

import { useAuth } from '../../context/AuthContext'

function PermissionButton({ permission, anyOf, allOf, children, ...props }) {
  const { can, canAny, canAll } = useAuth()

  if (permission && !can(permission))   return null
  if (anyOf?.length && !canAny(anyOf)) return null
  if (allOf?.length && !canAll(allOf)) return null

  return <button {...props}>{children}</button>
}

export default PermissionButton