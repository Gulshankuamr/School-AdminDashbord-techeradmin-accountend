// src/config/permissions.js

export const PERMISSIONS = {

  // 🎓 STUDENTS
  VIEW_ALL_STUDENT:            'view_all_student',
  ADD_STUDENT:                 'add_student',
  EDIT_STUDENT:                'edit_student',
  VIEW_ONE_STUDENT_ATTENDANCE: 'view_one_student_attendance',
  MARK_STUDENT_ATTENDANCE:     'mark_student_attendance',

  // 👨‍🏫 TEACHERS
  VIEW_ALL_TEACHER:            'view_all_teacher',
  ADD_TEACHER:                 'add_teacher',
  EDIT_TEACHER:                'edit_teacher',
  VIEW_ONE_TEACHER_ATTENDANCE: 'view_one_teacher_attendance',

  // 💼 ACCOUNTANTS
  VIEW_ACCOUNTANTS:            'view_accountants',
  ADD_ACCOUNTANT:              'add_accountant',
  EDIT_ACCOUNTANT:             'edit_accountants',   // plural — backend match

  // 🏫 CLASSES & SECTIONS
  VIEW_CLASSES:                'view_classes',
  MANAGE_CLASSES:              'manage_classes',
  VIEW_SECTIONS:               'view_sections',
  MANAGE_SECTIONS:             'manage_sections',

  // 📚 SUBJECTS
  VIEW_SUBJECTS:               'view_subjects',
  ADD_SUBJECT:                 'add_subject',
  EDIT_SUBJECT:                'edit_subject',

  // 📖 HOMEWORK
  VIEW_HW_FROM_STUDENT:        'view_hw_from_student',
  TEACHER_CREATE_HOMEWORK:     'teacher_create_homework',

  // 📅 TIMETABLE
  VIEW_TIMETABLE:              'view_timetable',
  MANAGE_TIMETABLE:            'manage_timetable',

  // 📝 EXAMS — all granular permissions
  MANAGE_EXAM_MARKS:           'manage_exam_marks',
  GENERATE_MARKSHEET:          'generate_marksheet',
  CREATE_EXAM:                 'create_exam',
  EDIT_EXAM:                   'edit_exam',
  VIEW_EXAM:                   'view_exam',
  CREATE_EXAM_TIMETABLE:       'create_exam_timetable',
  VIEW_EXAM_TIMETABLE:         'view_exam_timetable',
  ASSIGN_MARKS:                'assign_marks',
  VIEW_MARKS:                  'view_marks',
  MANAGE_CO_SCHOLASTIC:        'manage_co_scholastic',
  GENERATE_ADMIT_CARD:         'generate_admit_card',

  // 💰 FEES & PAYMENTS
  VIEW_FEES:                   'view_fees',
  MANAGE_FEES:                 'manage_fees',
  COLLECT_PAYMENT:             'collect_payment',
  VIEW_PAYMENTS:               'view_payments',
  GENERATE_RECEIPT:            'generate_receipt',

  // 🚍 TRANSPORT
  MANAGE_TRANSPORT:            'manage_transport',

  // 🔔 NOTIFICATIONS
  NOTIFICATION_VIEW:           'notification_view',
  NOTIFICATION_SEND:           'notification_send',

  // 📊 REPORTS
  VIEW_REPORTS:                'view_reports',

  // ⚙️ SETTINGS
  MANAGE_PERMISSIONS:          'manage_permissions',
  MANAGE_SCHOOL_SETTINGS:      'manage_school_settings',
}

export const mapPermissions = (backendPerms = []) => {
  if (!Array.isArray(backendPerms)) return []
  return backendPerms.filter(Boolean)
}