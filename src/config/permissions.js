// // src/config/permissions.js

// export const PERMISSIONS = {

//   // 🎓 STUDENTS
//   VIEW_ALL_STUDENT:            'view_all_student',
//   ADD_STUDENT:                 'add_student',
//   EDIT_STUDENT:                'edit_student',
//   VIEW_ONE_STUDENT_ATTENDANCE: 'view_one_student_attendance',
//   MARK_STUDENT_ATTENDANCE:     'mark_student_attendance',

//   // 👨‍🏫 TEACHERS
//   VIEW_ALL_TEACHER:            'view_all_teacher',
//   ADD_TEACHER:                 'add_teacher',
//   EDIT_TEACHER:                'edit_teacher',
//   VIEW_ONE_TEACHER_ATTENDANCE: 'view_one_teacher_attendance',

//   // 💼 ACCOUNTANTS
//   VIEW_ACCOUNTANTS:            'view_accountants',
//   ADD_ACCOUNTANT:              'add_accountant',
//   EDIT_ACCOUNTANT:             'edit_accountants',   // plural — backend match

//   // 🏫 CLASSES & SECTIONS
//   VIEW_CLASSES:                'view_classes',
//   MANAGE_CLASSES:              'manage_classes',
//   VIEW_SECTIONS:               'view_sections',
//   MANAGE_SECTIONS:             'manage_sections',

//   // 📚 SUBJECTS
//   VIEW_SUBJECTS:               'view_subjects',
//   ADD_SUBJECT:                 'add_subject',
//   EDIT_SUBJECT:                'edit_subject',

//   // 📖 HOMEWORK
//   VIEW_HW_FROM_STUDENT:        'view_hw_from_student',
//   TEACHER_CREATE_HOMEWORK:     'teacher_create_homework',

//   // 📅 TIMETABLE
//   VIEW_TIMETABLE:              'view_timetable',
//   MANAGE_TIMETABLE:            'manage_timetable',

//   // 📝 EXAMS — all granular permissions
//   MANAGE_EXAM_MARKS:           'manage_exam_marks',
//   GENERATE_MARKSHEET:          'generate_marksheet',
//   CREATE_EXAM:                 'create_exam',
//   EDIT_EXAM:                   'edit_exam',
//   VIEW_EXAM:                   'view_exam',
//   CREATE_EXAM_TIMETABLE:       'create_exam_timetable',
//   VIEW_EXAM_TIMETABLE:         'view_exam_timetable',
//   ASSIGN_MARKS:                'assign_marks',
//   VIEW_MARKS:                  'view_marks',
//   MANAGE_CO_SCHOLASTIC:        'manage_co_scholastic',
//   GENERATE_ADMIT_CARD:         'generate_admit_card',

//   // 💰 FEES & PAYMENTS
//   VIEW_FEES:                   'view_fees',
//   MANAGE_FEES:                 'manage_fees',
//   COLLECT_PAYMENT:             'collect_payment',
//   VIEW_PAYMENTS:               'view_payments',
//   GENERATE_RECEIPT:            'generate_receipt',

//   // 🚍 TRANSPORT
//   MANAGE_TRANSPORT:            'manage_transport',

//   // 🔔 NOTIFICATIONS
//   NOTIFICATION_VIEW:           'notification_view',
//   NOTIFICATION_SEND:           'notification_send',

//   // 📊 REPORTS
//   VIEW_REPORTS:                'view_reports',

//   // ⚙️ SETTINGS
//   MANAGE_PERMISSIONS:          'manage_permissions',
//   MANAGE_SCHOOL_SETTINGS:      'manage_school_settings',
// }

// export const mapPermissions = (backendPerms = []) => {
//   if (!Array.isArray(backendPerms)) return []
//   return backendPerms.filter(Boolean)
// }




// src/config/permissions.js

// export const PERMISSIONS = {

//   // 🎓 STUDENTS
//   VIEW_ALL_STUDENT:            'view_all_student',
//   ADD_STUDENT:                 'add_student',
//   EDIT_STUDENT:                'edit_student',
//   VIEW_ONE_STUDENT_ATTENDANCE: 'view_one_student_attendance',
//   MARK_STUDENT_ATTENDANCE:     'mark_student_attendance',

//   // 👨‍🏫 TEACHERS
//   VIEW_ALL_TEACHER:            'view_all_teacher',
//   ADD_TEACHER:                 'add_teacher',
//   EDIT_TEACHER:                'edit_teacher',
//   VIEW_ONE_TEACHER_ATTENDANCE: 'view_one_teacher_attendance',
//   MARK_TEACHER_ATTENDANCE:     'mark_teacher_attendance',   // ⚠️ backend me abhi nahi — add karwao

//   // 💼 ACCOUNTANTS
//   VIEW_ACCOUNTANTS:            'view_accountants',
//   ADD_ACCOUNTANT:              'add_accountant',
//   EDIT_ACCOUNTANT:             'edit_accountants',

//   // 🏫 CLASSES & SECTIONS
//   VIEW_CLASSES:                'view_classes',
//   MANAGE_CLASSES:              'manage_classes',
//   VIEW_SECTIONS:               'view_sections',
//   MANAGE_SECTIONS:             'manage_sections',

//   // 📚 SUBJECTS
//   VIEW_SUBJECTS:               'view_subjects',
//   ADD_SUBJECT:                 'add_subject',
//   EDIT_SUBJECT:                'edit_subject',

//   // 📖 HOMEWORK
//   VIEW_HW_FROM_STUDENT:        'view_hw_from_student',
//   TEACHER_CREATE_HOMEWORK:     'teacher_create_homework',

//   // 📅 TIMETABLE
//   VIEW_TIMETABLE:              'view_timetable',
//   MANAGE_TIMETABLE:            'manage_timetable',

//   // 📝 EXAMS
//   MANAGE_EXAM_MARKS:           'manage_exam_marks',
//   GENERATE_MARKSHEET:          'generate_marksheet',
//   CREATE_EXAM:                 'create_exam',               // ⚠️ backend me abhi nahi — add karwao
//   EDIT_EXAM:                   'edit_exam',
//   VIEW_EXAM:                   'view_exam',
//   CREATE_EXAM_TIMETABLE:       'create_exam_timetable',
//   VIEW_EXAM_TIMETABLE:         'view_exam_timetable',
//   ASSIGN_MARKS:                'assign_marks',
//   VIEW_MARKS:                  'view_marks',
//   MANAGE_CO_SCHOLASTIC:        'manage_co_scholastic',
//   GENERATE_ADMIT_CARD:         'generate_admit_card',

//   // 💰 FEES & PAYMENTS
//   VIEW_FEES:                   'view_fees',
//   MANAGE_FEES:                 'manage_fees',
//   COLLECT_PAYMENT:             'collect_payment',
//   VIEW_PAYMENTS:               'view_payments',
//   GENERATE_RECEIPT:            'generate_receipt',

//   // 🚍 TRANSPORT
//   MANAGE_TRANSPORT:            'manage_transport',

//   // 🔔 NOTIFICATIONS
//   NOTIFICATION_VIEW:           'notification_view',
//   NOTIFICATION_SEND:           'notification_send',

//   // 📊 REPORTS
//   VIEW_REPORTS:                'view_reports',

//   // ⚙️ SETTINGS
//   MANAGE_PERMISSIONS:          'manage_permissions',
//   MANAGE_SCHOOL_SETTINGS:      'manage_school_settings',
// }

// export const mapPermissions = (backendPerms = []) => {
//   if (!Array.isArray(backendPerms)) return []
//   return backendPerms.filter(Boolean)
// }





// src/config/permissions.js

export const PERMISSIONS = {

  // 🎓 STUDENTS
  VIEW_ALL_STUDENT:            'view_all_student',
  ADD_STUDENT:                 'add_student',
  EDIT_STUDENT:                'edit_student',
  DELETE_STUDENT:              'delete_student',
  VIEW_ONE_STUDENT_ATTENDANCE: 'view_one_student_attendance',
  MARK_STUDENT_ATTENDANCE:     'mark_student_attendance',

  // 👨‍🏫 TEACHERS
  VIEW_ALL_TEACHER:            'view_all_teacher',
  ADD_TEACHER:                 'add_teacher',
  EDIT_TEACHER:                'edit_teacher',
  DELETE_TEACHER:              'delete_teacher',
  VIEW_ONE_TEACHER_ATTENDANCE: 'view_one_teacher_attendance',
  MARK_TEACHER_ATTENDANCE:     'mark_teacher_attendance',

  // 💼 ACCOUNTANTS
  VIEW_ACCOUNTANTS:            'view_accountants',
  ADD_ACCOUNTANT:              'add_accountant',
  EDIT_ACCOUNTANT:             'edit_accountants',   // ← backend string: 'edit_accountants' (plural)
  DELETE_ACCOUNTANT:           'delete_accountant',

  // 🏫 CLASSES & SECTIONS
  VIEW_CLASSES:                'view_classes',
  MANAGE_CLASSES:              'manage_classes',
  VIEW_SECTIONS:               'view_sections',
  MANAGE_SECTIONS:             'manage_sections',

  // 📚 SUBJECTS
  VIEW_SUBJECTS:               'view_subjects',
  ADD_SUBJECT:                 'add_subject',
  EDIT_SUBJECT:                'edit_subject',
  DELETE_SUBJECT:              'delete_subject',

  // 📖 HOMEWORK
  VIEW_HW_FROM_STUDENT:        'view_hw_from_student',
  TEACHER_CREATE_HOMEWORK:     'teacher_create_homework',

  // 📅 TIMETABLE
  VIEW_TIMETABLE:              'view_timetable',
  MANAGE_TIMETABLE:            'manage_timetable',

  // 📝 EXAMS
  MANAGE_EXAM_MARKS:           'manage_exam_marks',
  GENERATE_MARKSHEET:          'generate_marksheet',
  CREATE_EXAM:                 'create_exam',
  EDIT_EXAM:                   'edit_exam',
  DELETE_EXAM:                 'delete_exam',
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

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON-LEVEL PERMISSION MAP
// Har module ke action buttons ke liye exact permission key
// Use: BUTTON_PERMISSIONS.student.add  →  'add_student'
// ─────────────────────────────────────────────────────────────────────────────
export const BUTTON_PERMISSIONS = {
  student: {
    add:              PERMISSIONS.ADD_STUDENT,               // 'add_student'
    edit:             PERMISSIONS.EDIT_STUDENT,              // 'edit_student'
    delete:           PERMISSIONS.DELETE_STUDENT,            // 'delete_student'
    viewAttendance:   PERMISSIONS.VIEW_ONE_STUDENT_ATTENDANCE, // 'view_one_student_attendance'
    markAttendance:   PERMISSIONS.MARK_STUDENT_ATTENDANCE,   // 'mark_student_attendance'
  },
  teacher: {
    add:              PERMISSIONS.ADD_TEACHER,               // 'add_teacher'
    edit:             PERMISSIONS.EDIT_TEACHER,              // 'edit_teacher'
    delete:           PERMISSIONS.DELETE_TEACHER,            // 'delete_teacher'
    viewAttendance:   PERMISSIONS.VIEW_ONE_TEACHER_ATTENDANCE, // 'view_one_teacher_attendance'
    markAttendance:   PERMISSIONS.MARK_TEACHER_ATTENDANCE,   // 'mark_teacher_attendance'
  },
  accountant: {
    add:              PERMISSIONS.ADD_ACCOUNTANT,            // 'add_accountant'
    edit:             PERMISSIONS.EDIT_ACCOUNTANT,           // 'edit_accountants'
    delete:           PERMISSIONS.DELETE_ACCOUNTANT,         // 'delete_accountant'
  },
  classes: {
    manage:           PERMISSIONS.MANAGE_CLASSES,            // 'manage_classes'
  },
  sections: {
    manage:           PERMISSIONS.MANAGE_SECTIONS,           // 'manage_sections'
  },
  subjects: {
    add:              PERMISSIONS.ADD_SUBJECT,               // 'add_subject'
    edit:             PERMISSIONS.EDIT_SUBJECT,              // 'edit_subject'
    delete:           PERMISSIONS.DELETE_SUBJECT,            // 'delete_subject'
  },
  homework: {
    create:           PERMISSIONS.TEACHER_CREATE_HOMEWORK,   // 'teacher_create_homework'
    view:             PERMISSIONS.VIEW_HW_FROM_STUDENT,      // 'view_hw_from_student'
  },
  timetable: {
    manage:           PERMISSIONS.MANAGE_TIMETABLE,          // 'manage_timetable'
  },
  exam: {
    create:           PERMISSIONS.CREATE_EXAM,               // 'create_exam'
    edit:             PERMISSIONS.EDIT_EXAM,                 // 'edit_exam'
    delete:           PERMISSIONS.DELETE_EXAM,               // 'delete_exam'
    assignMarks:      PERMISSIONS.ASSIGN_MARKS,              // 'assign_marks'
    generateMarksheet:PERMISSIONS.GENERATE_MARKSHEET,        // 'generate_marksheet'
    generateAdmitCard:PERMISSIONS.GENERATE_ADMIT_CARD,       // 'generate_admit_card'
    createTimetable:  PERMISSIONS.CREATE_EXAM_TIMETABLE,     // 'create_exam_timetable'
    manageCoScholastic: PERMISSIONS.MANAGE_CO_SCHOLASTIC,    // 'manage_co_scholastic'
  },
  fees: {
    manage:           PERMISSIONS.MANAGE_FEES,               // 'manage_fees'
    collect:          PERMISSIONS.COLLECT_PAYMENT,           // 'collect_payment'
    generateReceipt:  PERMISSIONS.GENERATE_RECEIPT,          // 'generate_receipt'
    viewPayments:     PERMISSIONS.VIEW_PAYMENTS,             // 'view_payments'
  },
  transport: {
    manage:           PERMISSIONS.MANAGE_TRANSPORT,          // 'manage_transport'
  },
  notifications: {
    send:             PERMISSIONS.NOTIFICATION_SEND,         // 'notification_send'
  },
  reports: {
    view:             PERMISSIONS.VIEW_REPORTS,              // 'view_reports'
  },
  settings: {
    managePermissions:    PERMISSIONS.MANAGE_PERMISSIONS,    // 'manage_permissions'
    manageSchoolSettings: PERMISSIONS.MANAGE_SCHOOL_SETTINGS, // 'manage_school_settings'
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// mapPermissions — backend se aaye array ko filter karta hai
// ─────────────────────────────────────────────────────────────────────────────
export const mapPermissions = (backendPerms = []) => {
  if (!Array.isArray(backendPerms)) return []
  return backendPerms.filter(Boolean)
}