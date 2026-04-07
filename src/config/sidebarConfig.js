// src/config/sidebarConfig.js
//
// ✅ All permission references use P.* constants
//    which resolve to snake_case strings exactly matching the backend.
// ✅ edit_accountants typo fixed via permissions.js (P.EDIT_ACCOUNTANT → 'edit_accountants')

import {
  LayoutDashboard, Users, BookOpen, Wallet, Calendar,
  DollarSign, ClipboardCheck, FileText, Settings, MapPin,
  Bell, GraduationCap, UserCheck, BadgeDollarSign,
  MessageSquare, Bus, Cpu, UsersRound, BookUser, LayoutGrid,
  Receipt, CreditCard,
} from 'lucide-react'
import { PERMISSIONS as P } from './permissions.js'

export const sidebarMenuItems = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 DASHBOARD — open to all logged-in users
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:         'dashboard',
    label:      'Dashboard',
    icon:       LayoutDashboard,
    path:       '/admin',
    permission: null,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎓 ACADEMIC MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-academic',
    label:   'Academic Management',
    icon:    GraduationCap,
    isGroup: true,
    color:   'blue',

    items: [

      {
        id:          'students',
        label:       'Students',
        icon:        Users,
        hasDropdown: true,
        permission:  P.VIEW_ALL_STUDENT,
        subItems: [
          { id: 'add-student',  label: 'Add Student',  path: '/admin/students/add', permission: P.ADD_STUDENT      },
          { id: 'student-list', label: 'All Students', path: '/admin/students',     permission: P.VIEW_ALL_STUDENT },       
        ],
      },

      {
        id:          'class-sections',
        label:       'Classes & Sections',
        icon:        LayoutGrid,
        hasDropdown: false,
        path:        '/admin/classes/sections',
        permission:  [P.VIEW_CLASSES, P.VIEW_SECTIONS],
      },

      {
        id:          'subjects',
        label:       'Subjects',
        icon:        BookOpen,
        hasDropdown: true,
        permission:  P.VIEW_SUBJECTS,
        subItems: [
          // { id: 'subject-list', label: 'Add & view ', path: '/admin/subject',      permission: P.VIEW_SUBJECTS },
          { id: 'add-subject',  label: 'Add & view  Subject',  path: '/admin/subject/add',  permission: P.ADD_SUBJECT   },
        ],
      },

      {
        id:          'homework',
        label:       'Homework',
        icon:        BookOpen,
        hasDropdown: true,
        permission:  [P.VIEW_HW_FROM_STUDENT, P.TEACHER_CREATE_HOMEWORK],
        subItems: [
          { id: 'create-homework', label: 'Create Homework', path: '/admin/homework/create', permission: P.TEACHER_CREATE_HOMEWORK },
          { id: 'homework-list',   label: 'Homework List',   path: '/admin/homework',        permission: P.VIEW_HW_FROM_STUDENT   },
        ],
      },

      {
        id:          'timetable',
        label:       'School Timetable',
        icon:        Calendar,
        hasDropdown: true,
        permission:  [P.VIEW_TIMETABLE, P.MANAGE_TIMETABLE],
        subItems: [
          { id: 'create-timetable', label: 'Create Timetable', path: '/admin/timetable/create', permission: P.MANAGE_TIMETABLE },
          { id: 'view-timetable',   label: 'View Timetable',   path: '/admin/timetable/view',   permission: P.VIEW_TIMETABLE   },
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 EXAMS MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // {
  //   id:      'group-exams',
  //   label:   'Exams Management',
  //   icon:    FileText,
  //   isGroup: true,
  //   color:   'violet',

  //   items: [
  //     {
  //       id:          'exams',
  //       label:       'Exams',
  //       icon:        FileText,
  //       hasDropdown: true,
  //       permission:  [P.MANAGE_EXAM_MARKS, P.GENERATE_MARKSHEET , P.CREATE_EXAM,],
  //       subItems: [
  //         { id: 'create-exam',           label: 'Create Exam',          path: '/admin/exams/add',                permission: P.CREATE_EXAM, },
  //         { id: 'exam-timetable-create', label: 'Exam Timetable',       path: '/admin/exams/timetable/create',    permission: P.MANAGE_EXAM_MARKS  },
  //         { id: 'assign-marks',          label: 'Create Marks',         path: '/admin/exams/assign-marks',        permission: P.MANAGE_EXAM_MARKS  },
  //         { id: 'marks-list',            label: 'Marks List',           path: '/admin/exams/marks-list',          permission: P.MANAGE_EXAM_MARKS  },
  //         { id: 'co-scholastic-grades',  label: 'Co-Scholastic Grades', path: '/admin/exams/co-scholastic',       permission: P.MANAGE_EXAM_MARKS  },
  //         { id: 'marksheet-generator',   label: 'Generate Marksheet',   path: '/admin/exams/marksheet-generator', permission: P.GENERATE_MARKSHEET },
  //         { id: 'generate-admit-card',   label: 'Admit & ID Cards',     path: '/admin/exams/admit-card',          permission: P.MANAGE_EXAM_MARKS  },
  //       ],
  //     },
  //   ],
  // },


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 EXAMS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// {
//   id:      'group-exams',
//   label:   'Exams Management',
//   icon:    FileText,
//   isGroup: true,
//   color:   'violet',

//   items: [
//     {
//       id:          'exams',
//       label:       'Exams',
//       icon:        FileText,
//       hasDropdown: true,
//       // Group visible hoga agar inme se koi ek permission ho
//       permission: [
//         P.CREATE_EXAM, P.VIEW_EXAM, P.EDIT_EXAM,
//         P.CREATE_EXAM_TIMETABLE, P.VIEW_EXAM_TIMETABLE,
//         P.ASSIGN_MARKS, P.VIEW_MARKS,
//         P.MANAGE_CO_SCHOLASTIC, P.GENERATE_MARKSHEET,
//         P.GENERATE_ADMIT_CARD, P.MANAGE_EXAM_MARKS,
//       ],
//       subItems: [
//         {
//           id:         'create-exam',
//           label:      'Create Exam',
//           path:       '/admin/exams/add',
//           permission: P.CREATE_EXAM,
//         },
//         {
//           id:         'view-exams',
//           label:      'View Exams',
//           path:       '/admin/exams',          // ← yahi path tha jo kaam nahi kar raha tha
//           permission: P.VIEW_EXAM,
//         },
//         {
//           id:         'exam-timetable-create',
//           label:      'Create Exam Timetable',
//           path:       '/admin/exams/timetable/create',
//           permission: P.CREATE_EXAM_TIMETABLE,
//         },
//         {
//           id:         'exam-timetable-view',
//           label:      'View Exam Timetable',
//           path:       '/admin/exams/timetable',
//           permission: P.VIEW_EXAM_TIMETABLE,
//         },
//         {
//           id:         'assign-marks',
//           label:      'Create Marks',
//           path:       '/admin/exams/assign-marks',
//           permission: P.ASSIGN_MARKS,
//         },
//         {
//           id:         'marks-list',
//           label:      'Marks List',
//           path:       '/admin/exams/marks-list',
//           permission: P.VIEW_MARKS,
//         },
//         {
//           id:         'co-scholastic-grades',
//           label:      'Co-Scholastic Grades',
//           path:       '/admin/exams/co-scholastic',
//           permission: P.MANAGE_CO_SCHOLASTIC,
//         },
//         {
//           id:         'marksheet-generator',
//           label:      'Generate Marksheet',
//           path:       '/admin/exams/marksheet-generator',
//           permission: P.GENERATE_MARKSHEET,
//         },
//         {
//           id:         'generate-admit-card',
//           label:      'Admit & ID Cards',
//           path:       '/admin/exams/admit-card',
//           permission: P.GENERATE_ADMIT_CARD,
//         },
//       ],
//     },
//   ],
// },


 {
    id:      'group-exams',
    label:   'Exams Management',
    icon:    FileText,
    isGroup: true,
    color:   'violet',

    items: [
      {
        id:          'exams',
        label:       'Exams',
        icon:        FileText,
        hasDropdown: true,
        // Group tab visible hoga jab inme se KOI EK bhi permission ho
        permission: [
          P.CREATE_EXAM,
          P.VIEW_EXAM,
          P.EDIT_EXAM,
          P.CREATE_EXAM_TIMETABLE,
          P.VIEW_EXAM_TIMETABLE,
          P.ASSIGN_MARKS,
          P.VIEW_MARKS,
          P.MANAGE_CO_SCHOLASTIC,
          P.GENERATE_MARKSHEET,
          P.GENERATE_ADMIT_CARD,
          P.MANAGE_EXAM_MARKS,
        ],
        subItems: [
          {
            id:         'create-exam',
            label:      'Create Exam',
            path:       '/admin/exams/add',
            permission: P.CREATE_EXAM,
          },
          {
            id:         'view-exams',
            label:      'View Exams',
            path:       '/admin/exams',
            permission: P.VIEW_EXAM,
          },
          {
            id:         'exam-timetable-create',
            label:      'Create Exam Timetable',
            path:       '/admin/exams/timetable/create',
            permission: P.CREATE_EXAM_TIMETABLE,
          },
          {
            id:         'exam-timetable-view',
            label:      'View Exam Timetable',
            path:       '/admin/exams/timetable',
            permission: P.VIEW_EXAM_TIMETABLE,
          },
          {
            id:         'assign-marks',
            label:      'Create Marks',
            path:       '/admin/exams/assign-marks',
            permission: P.ASSIGN_MARKS,
          },
          {
            id:         'marks-list',
            label:      'Marks List',
            path:       '/admin/exams/marks-list',
            permission: P.VIEW_MARKS,
          },
          {
            id:         'co-scholastic-grades',
            label:      'Co-Scholastic Grades',
            path:       '/admin/exams/co-scholastic',
            permission: P.MANAGE_CO_SCHOLASTIC,
          },
          {
            id:         'marksheet-generator',
            label:      'Generate Marksheet',
            path:       '/admin/exams/marksheet-generator',
            permission: P.GENERATE_MARKSHEET,
          },
          {
            id:         'generate-admit-card',
            label:      'Admit & ID Cards',
            path:       '/admin/exams/admit-card',
            permission: P.GENERATE_ADMIT_CARD,
          },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👨‍🏫 STAFF MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-staff',
    label:   'Staff Management',
    icon:    UsersRound,
    isGroup: true,
    color:   'purple',

    items: [

      {
        id:          'teachers',
        label:       'Teachers',
        icon:        BookUser,
        hasDropdown: true,
        permission:  P.VIEW_ALL_TEACHER,
        subItems: [
          { id: 'teacher-list', label: 'All Teachers', path: '/admin/teachers',     permission: P.VIEW_ALL_TEACHER },
          { id: 'add-teacher',  label: 'Add Teacher',  path: '/admin/teachers/add', permission: P.ADD_TEACHER      },
        ],
      },

      {
        id:          'accountants',
        label:       'Accountants',
        icon:        Wallet,
        hasDropdown: true,
        permission:  P.VIEW_ACCOUNTANTS,
        subItems: [
          { id: 'accountant-list', label: 'All Accountants', path: '/admin/accountants',     permission: P.VIEW_ACCOUNTANTS },
          { id: 'add-accountant',  label: 'Add Accountant',  path: '/admin/accountants/add', permission: P.ADD_ACCOUNTANT   },
        ],
      },

    ],
  },

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📅 ATTENDANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  id:      'group-attendance',
  label:   'Attendance',
  icon:    ClipboardCheck,
  isGroup: true,
  color:   'green',

  items: [

    {
      id:          'student-attendance',
      label:       'Student Attendance',
      icon:        Users,
      hasDropdown: true,
      permission:  [P.MARK_STUDENT_ATTENDANCE, P.VIEW_ALL_STUDENT],
      subItems: [
        {
          id:         'mark-student-attendance',
          label:      'Mark Attendance',
          path:       '/admin/attendance',
          permission: P.MARK_STUDENT_ATTENDANCE,
        },
        {
          id:         'student-attendance-list',
          label:      'Attendance List',
          path:       '/admin/attendance/list',
          permission: P.VIEW_ALL_STUDENT,
        },
      ],
    },

    {
      id:          'teacher-attendance',
      label:       'Teacher Attendance',
      icon:        BookUser,
      hasDropdown: true,
      permission:  P.VIEW_ONE_TEACHER_ATTENDANCE,
      subItems: [
        {
          id:         'mark-teacher-attendance',
          label:      'Mark Attendance',
          path:       '/admin/teacher-attendance',
          permission: P.VIEW_ONE_TEACHER_ATTENDANCE,
        },
        {
          id:         'teacher-attendance-list',
          label:      'Attendance List',
          path:       '/admin/teacher-attendance/list',
          permission: P.VIEW_ONE_TEACHER_ATTENDANCE,
        },
      ],
    },

    {
      id:          'accountant-attendance',
      label:       'Accountant Attendance',
      icon:        Wallet,
      hasDropdown: true,
      permission:  P.VIEW_ACCOUNTANTS,
      subItems: [
        {
          id:         'mark-accountant-attendance',
          label:      'Mark Attendance',
          path:       '/admin/accountant-attendance',
          permission: P.VIEW_ACCOUNTANTS,
        },
        {
          id:         'accountant-attendance-list',
          label:      'Attendance List',
          path:       '/admin/accountant-attendance/list',
          permission: P.VIEW_ACCOUNTANTS,
        },
      ],
    },

  ],
},

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚍 TRANSPORT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-transport',
    label:   'Transport',
    icon:    Bus,
    isGroup: true,
    color:   'orange',

    items: [

      {
        id:         'transport-routes',
        label:      'Routes Management',
        icon:       Bus,
        path:       '/admin/transport/routes',
        permission: P.MANAGE_TRANSPORT,
      },

      {
        id:         'transport-stops',
        label:      'Stops Management',
        icon:       MapPin,
        path:       '/admin/transport/stops',
        permission: P.MANAGE_TRANSPORT,
      },

      {
        id:         'assign-transport',
        label:      'Assign Transport',
        icon:       UserCheck,
        path:       '/admin/transport/assign-student',
        permission: P.MANAGE_TRANSPORT,
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💰 FINANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-finance',
    label:   'Finance',
    icon:    BadgeDollarSign,
    isGroup: true,
    color:   'amber',

    items: [

      {
        id:          'fees',
        label:       'Fee Management',
        icon:        DollarSign,
        hasDropdown: true,
        permission:  P.VIEW_FEES,
        subItems: [
          { id: 'fee-heads',      label: 'Fee Heads',            path: '/admin/fees/heads',           permission: P.VIEW_FEES       },
          { id: 'fee-fine-rules', label: 'Fine Rules',           path: '/admin/fees/fine-rule',       permission: P.VIEW_FEES       },
          { id: 'create-fee',     label: 'Create Fee Structure', path: '/admin/fees/create',          permission: P.MANAGE_FEES     },
          { id: 'fee-preview',    label: 'View Fee Structure',   path: '/admin/fees/preview',         permission: P.VIEW_FEES       },
          { id: 'collect-fee',    label: 'Collect Fee',          path: '/admin/fees-payment/collect', permission: P.COLLECT_PAYMENT },
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔔 COMMUNICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id:      'group-communication',
    label:   'Communication',
    icon:    MessageSquare,
    isGroup: true,
    color:   'sky',

    items: [

      {
        id:          'notifications',
        label:       'Notifications',
        icon:        Bell,
        hasDropdown: true,
        permission:  P.NOTIFICATION_VIEW,
        subItems: [
          { id: 'create-notification', label: 'Send Notification',  path: '/admin/notifications/create', permission: P.NOTIFICATION_SEND },
          { id: 'sent-notifications',  label: 'Sent Notifications', path: '/admin/notifications',        permission: P.NOTIFICATION_VIEW },
          { id: 'my-notifications',    label: 'My Inbox',           path: '/admin/my-notifications',     permission: null                },
        ],
      },

    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ SYSTEM SETTINGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // {
  //   id:      'group-system',
  //   label:   'System Settings',
  //   icon:    Cpu,
  //   isGroup: true,
  //   color:   'gray',

  //   items: [

  //     {
  //       id:          'settings',
  //       label:       'Settings',
  //       icon:        Settings,
  //       hasDropdown: true,
  //       adminOnly:   true,
  //       permission:  P.MANAGE_PERMISSIONS,
  //       subItems: [
  //         { id: 'role-permissions', label: 'Role Permissions', path: '/admin/settings/role-permissions', permission: P.MANAGE_PERMISSIONS, adminOnly: true },
  //         { id: 'user-permissions', label: 'User Permissions', path: '/admin/settings/user-permissions', permission: P.MANAGE_PERMISSIONS, adminOnly: true },
  //       ],
  //     },

  //   ],
  // },

]
