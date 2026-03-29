// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { PERMISSIONS as P } from './config/permissions.js'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Unauthorized from './pages/Unauthorized'
import Report from './pages/Report'

import CreateNotification  from './pages/notifications/CreateNotification'
import NotificationList    from './pages/notifications/NotificationList'
import NotificationDetails from './pages/notifications/NotificationDetails'
import MyNotificationsPage from './pages/notifications/MyNotificationsPage'

import AdminDashboard  from './pages/admin/AdminDashboard'
import RolePermissions from './pages/admin/RolePermissions'
import UserPermissions from './pages/admin/UserPermissions'

import StudentList from './pages/students/StudentList'
import AddStudent  from './pages/students/AddStudent'
import EditStudent from './pages/students/EditStudent'

import TeacherList from './pages/teachers/TeacherList'
import AddTeacher  from './pages/teachers/AddTeacher'
import EditTeacher from './pages/teachers/EditTeacher'

import AccountantList from './pages/accountants/AccountantList'
import AddAccountant  from './pages/accountants/AddAccountant'
import EditAccountant from './pages/accountants/EditAccountant'

import ClassList           from './pages/classes/ClassList'
import AddClass            from './pages/classes/AddClass'
import EditClass           from './pages/classes/EditClass'
import ClassSectionManager from './pages/classes/ClassSectionManager'
import SectionList         from './pages/sections/SectionList'
import AddSection          from './pages/sections/AddSection'
import EditSection         from './pages/sections/EditSection'

import SubjectList from './pages/subject/SubjectList'
import AddSubject  from './pages/subject/AddSubject'
import EditSubject from './pages/subject/EditSubject'

import MarkAttendance   from './pages/attendance/MarkAttendance'
import AttendanceList   from './pages/attendance/AttendanceList'
import AttendanceReport from './pages/attendance/AttendanceReport'

import MarkTeacherAttendance   from './pages/teacherAttendance/MarkTeacherAttendance'
import TeacherAttendanceList   from './pages/teacherAttendance/TeacherAttendanceList'
import TeacherAttendanceReport from './pages/teacherAttendance/TeacherAttendanceReport'

import MarkAccountantAttendance   from './pages/accountantAttendance/MarkAccountantAttendance'
import AccountantAttendanceList   from './pages/accountantAttendance/AccountantAttendanceList'
import AccountantAttendanceReport from './pages/accountantAttendance/AccountantAttendanceReport'

import CreateTimetable from './pages/timetable/CreateTimetable'
import ViewTimetable   from './pages/timetable/ViewTimetable'

import FeeHeads   from './pages/fees/FeeHeads'
import FineRule   from './pages/fees/FineRule'
import CreateFee  from './pages/fees/CreateFee'
import FeePreview from './pages/fees/FeePreview'

import CollectFee        from './pages/feesPayment/CollectFee'
import StudentFeeProfile from './pages/feesPayment/StudentFeeProfile'
import CollectFeePayment from './pages/feesPayment/CollectFeePayment'
import FeeReceipt        from './pages/feesPayment/FeeReceipt'

import ExamList                 from './pages/exams/ExamList'
import CreateExam               from './pages/exams/CreateExam'
import ViewExamTimetable        from './pages/exams/ViewExamTimetable'
import CreateExamTimetable      from './pages/exams/CreateExamTimetable'
import TimetablePreview         from './pages/exams/TimetablePreview'
import AssignMarks              from './pages/exams/AssignMarks'
import MarksList                from './pages/exams/MarksList'
import PrintMarksheet           from './pages/exams/PrintMarksheet'
import GenerateAdmitCard        from './pages/exams/GenerateAdmitCard'
import MarksheetGenerator       from './pages/exams/MarksheetGenerator'
import CreateCoScholasticGrades from './pages/exams/CreateCoScholasticGrades'
import CoScholasticGradesList   from './pages/exams/CoScholasticGradesList'

import RouteManagement        from './pages/transport/RouteManagement'
import StopManagement         from './pages/transport/StopManagement'
import AssignStudentTransport from './pages/transport/AssignStudentTransport'

import HomeworkList    from './pages/homework/HomeworkList'
import CreateHomework  from './pages/homework/CreateHomework'
import HomeworkDetails from './pages/homework/HomeworkDetails'
import EditHomework    from './pages/homework/EditHomework'

import Profile from './pages/profile/Profile'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [isCollapsed, setIsCollapsed]   = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isCollapsed}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
      />
      <main className={`pt-20 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      } p-6`}>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard & Profile — open to all */}
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* 🔔 Notifications */}
          <Route path="notifications" element={
            <ProtectedRoute permission={P.NOTIFICATION_VIEW}>
              <NotificationList />
            </ProtectedRoute>
          }/>
          <Route path="notifications/create" element={
            <ProtectedRoute permission={P.NOTIFICATION_SEND}>
              <CreateNotification />
            </ProtectedRoute>
          }/>
          <Route path="notifications/:id" element={
            <ProtectedRoute permission={P.NOTIFICATION_VIEW}>
              <NotificationDetails />
            </ProtectedRoute>
          }/>
          <Route path="my-notifications" element={<MyNotificationsPage />} />

          {/* 🎓 Students */}
          <Route path="students" element={
            <ProtectedRoute permission={P.VIEW_ALL_STUDENT}>
              <StudentList />
            </ProtectedRoute>
          }/>
          <Route path="students/add" element={
            <ProtectedRoute permission={P.ADD_STUDENT}>
              <AddStudent />
            </ProtectedRoute>
          }/>
          <Route path="students/edit/:id" element={
            <ProtectedRoute permission={P.EDIT_STUDENT}>
              <EditStudent />
            </ProtectedRoute>
          }/>

          {/* 👨‍🏫 Teachers */}
          <Route path="teachers" element={
            <ProtectedRoute permission={P.VIEW_ALL_TEACHER}>
              <TeacherList />
            </ProtectedRoute>
          }/>
          <Route path="teachers/add" element={
            <ProtectedRoute permission={P.ADD_TEACHER}>
              <AddTeacher />
            </ProtectedRoute>
          }/>
          <Route path="teachers/edit/:id" element={
            <ProtectedRoute permission={P.EDIT_TEACHER}>
              <EditTeacher />
            </ProtectedRoute>
          }/>

          {/* 💼 Accountants */}
          <Route path="accountants" element={
            <ProtectedRoute permission={P.VIEW_ACCOUNTANTS}>
              <AccountantList />
            </ProtectedRoute>
          }/>
          <Route path="accountants/add" element={
            <ProtectedRoute permission={P.ADD_ACCOUNTANT}>
              <AddAccountant />
            </ProtectedRoute>
          }/>
          {/* ✅ FIX: P.EDIT_ACCOUNTANT now resolves to 'edit_accountants' (plural) matching backend */}
          <Route path="accountants/edit/:id" element={
            <ProtectedRoute permission={P.EDIT_ACCOUNTANT}>
              <EditAccountant />
            </ProtectedRoute>
          }/>

          {/* 🏫 Classes & Sections */}
          <Route path="classes" element={
            <ProtectedRoute permission={P.VIEW_CLASSES}>
              <ClassList />
            </ProtectedRoute>
          }/>
          <Route path="classes/add" element={
            <ProtectedRoute permission={P.MANAGE_CLASSES}>
              <AddClass />
            </ProtectedRoute>
          }/>
          <Route path="classes/edit/:id" element={
            <ProtectedRoute permission={P.MANAGE_CLASSES}>
              <EditClass />
            </ProtectedRoute>
          }/>
          <Route path="classes/sections" element={
            <ProtectedRoute permission={[P.VIEW_CLASSES, P.VIEW_SECTIONS]}>
              <ClassSectionManager />
            </ProtectedRoute>
          }/>
          <Route path="sections" element={
            <ProtectedRoute permission={P.VIEW_SECTIONS}>
              <SectionList />
            </ProtectedRoute>
          }/>
          <Route path="sections/add" element={
            <ProtectedRoute permission={P.MANAGE_SECTIONS}>
              <AddSection />
            </ProtectedRoute>
          }/>
          <Route path="sections/edit/:id" element={
            <ProtectedRoute permission={P.MANAGE_SECTIONS}>
              <EditSection />
            </ProtectedRoute>
          }/>

          {/* 📚 Subjects */}
          <Route path="subject" element={
            <ProtectedRoute permission={P.VIEW_SUBJECTS}>
              <SubjectList />
            </ProtectedRoute>
          }/>
          <Route path="subject/add" element={
            <ProtectedRoute permission={P.ADD_SUBJECT}>
              <AddSubject />
            </ProtectedRoute>
          }/>
          <Route path="subject/edit/:id" element={
            <ProtectedRoute permission={P.EDIT_SUBJECT}>
              <EditSubject />
            </ProtectedRoute>
          }/>

          {/* 📅 Student Attendance */}
          <Route path="attendance" element={
            <ProtectedRoute permission={[P.MARK_STUDENT_ATTENDANCE, P.VIEW_ALL_STUDENT]}>
              <MarkAttendance />
            </ProtectedRoute>
          }/>
          <Route path="attendance/list" element={
            <ProtectedRoute permission={P.VIEW_ALL_STUDENT}>
              <AttendanceList />
            </ProtectedRoute>
          }/>
          <Route path="attendance/report" element={
            <ProtectedRoute permission={P.VIEW_ONE_STUDENT_ATTENDANCE}>
              <AttendanceReport />
            </ProtectedRoute>
          }/>

          {/* 📅 Teacher Attendance */}
          <Route path="teacher-attendance" element={
            <ProtectedRoute permission={P.VIEW_ONE_TEACHER_ATTENDANCE}>
              <MarkTeacherAttendance />
            </ProtectedRoute>
          }/>
          <Route path="teacher-attendance/list" element={
            <ProtectedRoute permission={P.VIEW_ONE_TEACHER_ATTENDANCE}>
              <TeacherAttendanceList />
            </ProtectedRoute>
          }/>
          <Route path="teacher-attendance/report" element={
            <ProtectedRoute permission={P.VIEW_ONE_TEACHER_ATTENDANCE}>
              <TeacherAttendanceReport />
            </ProtectedRoute>
          }/>

          {/* 📅 Accountant Attendance */}
          <Route path="accountant-attendance" element={
            <ProtectedRoute permission={P.VIEW_ACCOUNTANTS}>
              <MarkAccountantAttendance />
            </ProtectedRoute>
          }/>
          <Route path="accountant-attendance/list" element={
            <ProtectedRoute permission={P.VIEW_ACCOUNTANTS}>
              <AccountantAttendanceList />
            </ProtectedRoute>
          }/>
          <Route path="accountant-attendance/report" element={
            <ProtectedRoute permission={P.VIEW_ACCOUNTANTS}>
              <AccountantAttendanceReport />
            </ProtectedRoute>
          }/>

          {/* 📅 Timetable */}
          <Route path="timetable/create" element={
            <ProtectedRoute permission={P.MANAGE_TIMETABLE}>
              <CreateTimetable />
            </ProtectedRoute>
          }/>
          <Route path="timetable/view" element={
            <ProtectedRoute permission={P.VIEW_TIMETABLE}>
              <ViewTimetable />
            </ProtectedRoute>
          }/>

          {/* 💰 Fees */}
          <Route path="fees/heads" element={
            <ProtectedRoute permission={P.VIEW_FEES}>
              <FeeHeads />
            </ProtectedRoute>
          }/>
          <Route path="fees/fine-rule" element={
            <ProtectedRoute permission={P.VIEW_FEES}>
              <FineRule />
            </ProtectedRoute>
          }/>
          <Route path="fees/create" element={
            <ProtectedRoute permission={P.MANAGE_FEES}>
              <CreateFee />
            </ProtectedRoute>
          }/>
          <Route path="fees/preview" element={
            <ProtectedRoute permission={P.VIEW_FEES}>
              <FeePreview />
            </ProtectedRoute>
          }/>

          {/* 💳 Fee Payment */}
          <Route path="fees-payment/collect" element={
            <ProtectedRoute permission={P.COLLECT_PAYMENT}>
              <CollectFee />
            </ProtectedRoute>
          }/>
          <Route path="fees-payment/student/:studentId" element={
            <ProtectedRoute permission={P.VIEW_PAYMENTS}>
              <StudentFeeProfile />
            </ProtectedRoute>
          }/>
          <Route path="fees-payment/collect/:studentId" element={
            <ProtectedRoute permission={P.COLLECT_PAYMENT}>
              <CollectFeePayment />
            </ProtectedRoute>
          }/>
          <Route path="fees-payment/receipt/:receiptId" element={
            <ProtectedRoute permission={P.GENERATE_RECEIPT}>
              <FeeReceipt />
            </ProtectedRoute>
          }/>
          <Route path="fees-payment/receipts" element={
            <ProtectedRoute permission={P.GENERATE_RECEIPT}>
              <FeeReceipt />
            </ProtectedRoute>
          }/>

          {/* 📝 Exams */}
          <Route path="exams" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <ExamList />
            </ProtectedRoute>
          }/>
          <Route path="exams/add" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <CreateExam />
            </ProtectedRoute>
          }/>
          <Route path="exams/timetable" element={
            <ProtectedRoute permission={P.VIEW_TIMETABLE}>
              <ViewExamTimetable />
            </ProtectedRoute>
          }/>
          <Route path="exams/timetable/create" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <CreateExamTimetable />
            </ProtectedRoute>
          }/>
          <Route path="exams/timetable/edit/:id" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <CreateExamTimetable />
            </ProtectedRoute>
          }/>
          <Route path="exams/timetable/preview/:id" element={
            <ProtectedRoute permission={P.VIEW_TIMETABLE}>
              <TimetablePreview />
            </ProtectedRoute>
          }/>
          <Route path="exams/assign-marks" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <AssignMarks />
            </ProtectedRoute>
          }/>
          <Route path="exams/marks-list" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <MarksList />
            </ProtectedRoute>
          }/>
          <Route path="exams/print-marksheet" element={
            <ProtectedRoute permission={P.GENERATE_MARKSHEET}>
              <PrintMarksheet />
            </ProtectedRoute>
          }/>
          <Route path="exams/admit-card" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <GenerateAdmitCard />
            </ProtectedRoute>
          }/>
          <Route path="exams/marksheet-generator" element={
            <ProtectedRoute permission={P.GENERATE_MARKSHEET}>
              <MarksheetGenerator />
            </ProtectedRoute>
          }/>
          <Route path="exams/co-scholastic" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <CreateCoScholasticGrades />
            </ProtectedRoute>
          }/>
          <Route path="exams/co-scholastic/list" element={
            <ProtectedRoute permission={P.MANAGE_EXAM_MARKS}>
              <CoScholasticGradesList />
            </ProtectedRoute>
          }/>

          {/* 📖 Homework */}
          <Route path="homework" element={
            <ProtectedRoute permission={[P.VIEW_HW_FROM_STUDENT, P.TEACHER_CREATE_HOMEWORK]}>
              <HomeworkList />
            </ProtectedRoute>
          }/>
          <Route path="homework/create" element={
            <ProtectedRoute permission={P.TEACHER_CREATE_HOMEWORK}>
              <CreateHomework />
            </ProtectedRoute>
          }/>
          <Route path="homework/:id" element={
            <ProtectedRoute permission={[P.VIEW_HW_FROM_STUDENT, P.TEACHER_CREATE_HOMEWORK]}>
              <HomeworkDetails />
            </ProtectedRoute>
          }/>
          <Route path="homework/edit/:id" element={
            <ProtectedRoute permission={P.TEACHER_CREATE_HOMEWORK}>
              <EditHomework />
            </ProtectedRoute>
          }/>

          {/* 🚍 Transport */}
          <Route path="transport/routes" element={
            <ProtectedRoute permission={P.MANAGE_TRANSPORT}>
              <RouteManagement />
            </ProtectedRoute>
          }/>
          <Route path="transport/stops" element={
            <ProtectedRoute permission={P.MANAGE_TRANSPORT}>
              <StopManagement />
            </ProtectedRoute>
          }/>
          <Route path="transport/assign-student" element={
            <ProtectedRoute permission={P.MANAGE_TRANSPORT}>
              <AssignStudentTransport />
            </ProtectedRoute>
          }/>

          {/* 📊 Reports */}
          {/* ⚠️ view_reports — backend me abhi nahi hai, backend se add karwao */}
          <Route path="reports" element={
            <ProtectedRoute permission={P.VIEW_REPORTS}>
              <Report />
            </ProtectedRoute>
          }/>

          {/* ⚙️ Settings */}
          <Route path="settings">
            <Route path="role-permissions" element={
              <ProtectedRoute permission={P.MANAGE_PERMISSIONS} adminOnly>
                <RolePermissions />
              </ProtectedRoute>
            }/>
            <Route path="user-permissions" element={
              <ProtectedRoute permission={P.MANAGE_PERMISSIONS} adminOnly>
                <UserPermissions />
              </ProtectedRoute>
            }/>
          </Route>

        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
