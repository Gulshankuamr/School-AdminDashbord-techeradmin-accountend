// src/config/permissions.js

export const PERMISSIONS = {

  // 🎓 STUDENTS
  VIEW_ALL_STUDENT:           'view_all_student',
  ADD_STUDENT:                'add_student',
  EDIT_STUDENT:               'edit_student',
  VIEW_ONE_STUDENT_ATTENDANCE:'view_one_student_attendance',
  MARK_STUDENT_ATTENDANCE:    'mark_student_attendance',

  // 👨‍🏫 TEACHERS
  VIEW_ALL_TEACHER:           'view_all_teacher',
  ADD_TEACHER:                'add_teacher',
  EDIT_TEACHER:               'edit_teacher',
  VIEW_ONE_TEACHER_ATTENDANCE:'view_one_teacher_attendance',

  // 💼 ACCOUNTANTS
  // ✅ FIX: backend returns 'edit_accountants' (plural) — was 'edit_accountant' before
  VIEW_ACCOUNTANTS:           'view_accountants',
  ADD_ACCOUNTANT:             'add_accountant',
  EDIT_ACCOUNTANT:            'edit_accountants',

  // 🏫 CLASSES & SECTIONS
  VIEW_CLASSES:               'view_classes',
  MANAGE_CLASSES:             'manage_classes',
  VIEW_SECTIONS:              'view_sections',
  MANAGE_SECTIONS:            'manage_sections',

  // 📚 SUBJECTS
  VIEW_SUBJECTS:              'view_subjects',
  ADD_SUBJECT:                'add_subject',
  EDIT_SUBJECT:               'edit_subject',

  // 📖 HOMEWORK
  VIEW_HW_FROM_STUDENT:       'view_hw_from_student',
  TEACHER_CREATE_HOMEWORK:    'teacher_create_homework',

  // 📅 TIMETABLE
  VIEW_TIMETABLE:             'view_timetable',
  MANAGE_TIMETABLE:           'manage_timetable',

  // 📝 EXAMS
  MANAGE_EXAM_MARKS:          'manage_exam_marks',
  GENERATE_MARKSHEET:         'generate_marksheet',

  // 💰 FEES & PAYMENTS
  VIEW_FEES:                  'view_fees',
  MANAGE_FEES:                'manage_fees',
  COLLECT_PAYMENT:            'collect_payment',
  VIEW_PAYMENTS:              'view_payments',
  GENERATE_RECEIPT:           'generate_receipt',

  // 🚍 TRANSPORT
  MANAGE_TRANSPORT:           'manage_transport',

  // 🔔 NOTIFICATIONS
  NOTIFICATION_VIEW:          'notification_view',
  NOTIFICATION_SEND:          'notification_send',

  // 📊 REPORTS
  VIEW_REPORTS:               'view_reports',

  // ⚙️ SETTINGS
  MANAGE_PERMISSIONS:         'manage_permissions',
  MANAGE_SCHOOL_SETTINGS:     'manage_school_settings',
}

// ✅ Maps raw backend permissions array — filters nulls/falsy values
export const mapPermissions = (backendPerms = []) => {
  if (!Array.isArray(backendPerms)) return []
  return backendPerms.filter(Boolean)
}