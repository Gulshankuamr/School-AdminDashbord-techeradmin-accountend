import { API_BASE_URL, getAuthToken } from "./api"

/* ─── helper ─────────────────────────────────────────────────────── */
const authFetch = async (path) => {
  const token = getAuthToken()
  if (!token) throw new Error("Token missing")
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  if (!response.ok || data.success !== true)
    throw new Error(data.message || `Failed: ${path}`)
  return data
}

/* ─── time-ago formatter ─────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  if (!dateStr) return "recently"
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const dashboardService = {

  // ===============================
  // ADMIN PROFILE
  // ===============================
  getAdminProfile: async () => {
    const data = await authFetch("/schooladmin/getSchoolAdminProfile")
    return {
      name:           data?.data?.name               || "Admin",
      school_name:    data?.data?.school_name         || "",
      user_email:     data?.data?.user_email          || "",
      school_email:   data?.data?.school_email        || "",
      school_phone:   data?.data?.school_phone_number || "",
      school_address: data?.data?.school_address      || "",
      role:           data?.data?.role                || "school_admin",
    }
  },

  // ===============================
  // STUDENTS LIST  (raw — used by both count & activity)
  // ===============================
  getStudentsList: async () => {
    const data = await authFetch("/schooladmin/getTotalStudentsListBySchoolId")
    return data?.data || []
  },

  getTotalStudents: async () => {
    const list = await dashboardService.getStudentsList()
    return list.length
  },

  // ===============================
  // TEACHERS
  // ===============================
  getTotalTeachers: async () => {
    const data = await authFetch("/schooladmin/getTotalTeachersListBySchoolId")
    return data?.data?.length || 0
  },

  // ===============================
  // ACCOUNTANTS
  // ===============================
  getTotalAccountants: async () => {
    const data = await authFetch("/schooladmin/getTotalAccountantsListBySchoolId")
    return data?.data?.length || 0
  },

  // ===============================
  // CLASSES
  // ===============================
  getAllClasses: async () => {
    const data = await authFetch("/schooladmin/getAllClasses")
    return data?.data || []
  },

  // ===============================
  // SECTIONS BY CLASS
  // ===============================
  getSectionsByClassId: async (classId) => {
    const data = await authFetch(`/schooladmin/getAllSections?class_id=${classId}`)
    return data?.data || []
  },

  // ===============================
  // SENT NOTIFICATIONS
  // ===============================
  getSentNotifications: async () => {
    try {
      const data = await authFetch("/schooladmin/getSentNotifications")
      return data?.data || []
    } catch { return [] }
  },

  // ===============================
  // FEE PAYMENTS
  // ===============================
  getFeePayments: async () => {
    try {
      const data = await authFetch("/schooladmin/getFeePayments")
      return data?.data || []
    } catch { return [] }
  },

  // ===============================
  // STUDENT ATTENDANCE
  // ===============================
  getStudentAttendance: async () => {
    try {
      const data = await authFetch("/schooladmin/getStudentAttendance")
      return data?.data || []
    } catch { return [] }
  },

  // ===============================
  // RECENT ACTIVITIES  (combined feed)
  // Combines: admissions + fee + notifications + attendance
  // Returns latest 5 sorted by time
  // ===============================
  getRecentActivities: async () => {
    const [students, notifications, feePayments, attendance] = await Promise.all([
      dashboardService.getStudentsList().catch(() => []),
      dashboardService.getSentNotifications(),
      dashboardService.getFeePayments(),
      dashboardService.getStudentAttendance(),
    ])

    const activities = []

    // 1️⃣ Student Admissions — latest 3
    students
      .slice()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 3)
      .forEach((s) => {
        activities.push({
          type:      "admission",
          title:     "New student admission",
          desc:      `${s.name || "Student"} (ID: ${s.admission_no || s.student_id || "—"}) enrolled in ${s.class_name || `Class ${s.class_id}`}${s.section_name ? `-${s.section_name}` : ""}`,
          time:      timeAgo(s.created_at),
          timestamp: new Date(s.created_at || 0).getTime(),
        })
      })

    // 2️⃣ Fee Payments — latest 2
    feePayments
      .slice()
      .sort((a, b) => new Date(b.payment_date || b.created_at || 0) - new Date(a.payment_date || a.created_at || 0))
      .slice(0, 2)
      .forEach((f) => {
        const amount = f.amount || f.paid_amount || f.total_amount || ""
        const name   = f.student_name || f.name || "a student"
        activities.push({
          type:      "fee",
          title:     "Fee Payment Confirmed",
          desc:      `Transaction of ₹${amount} received from ${name}`,
          time:      timeAgo(f.payment_date || f.created_at),
          timestamp: new Date(f.payment_date || f.created_at || 0).getTime(),
        })
      })

    // 3️⃣ Notifications — latest 2
    notifications
      .slice()
      .sort((a, b) => new Date(b.created_at || b.sent_at || 0) - new Date(a.created_at || a.sent_at || 0))
      .slice(0, 2)
      .forEach((n) => {
        activities.push({
          type:      "notification",
          title:     "Notification Sent",
          desc:      n.message || n.title || n.body || "Notification broadcasted",
          time:      timeAgo(n.created_at || n.sent_at),
          timestamp: new Date(n.created_at || n.sent_at || 0).getTime(),
        })
      })

    // 4️⃣ Attendance Alert — count absent students
    if (attendance.length > 0) {
      const absentList  = attendance.filter((a) => a.status === "A" || a.status === "Absent")
      const absentCount = absentList.length
      if (absentCount > 0) {
        const sample    = absentList[0]
        const classInfo = sample?.class_name || (sample?.class_id ? `Class ${sample.class_id}` : "")
        activities.push({
          type:      "attendance",
          title:     "Attendance Alert",
          desc:      `${absentCount} student${absentCount > 1 ? "s" : ""} marked absent${classInfo ? ` in ${classInfo}` : ""}`,
          time:      timeAgo(sample?.date || sample?.created_at),
          timestamp: new Date(sample?.date || sample?.created_at || 0).getTime(),
        })
      }
    }

    // Sort by most recent → top 5
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
  },

  // ===============================
  // DASHBOARD STATS  (all counts)
  // ===============================
  getDashboardStats: async () => {
    try {
      const [profile, classes, students, teachers, accountants] = await Promise.all([
        dashboardService.getAdminProfile(),
        dashboardService.getAllClasses(),
        dashboardService.getTotalStudents(),
        dashboardService.getTotalTeachers(),
        dashboardService.getTotalAccountants(),
      ])

      // Fetch sections for every class in parallel
      const sectionResults = await Promise.allSettled(
        classes.map((cls) =>
          dashboardService.getSectionsByClassId(cls.class_id || cls.id)
        )
      )

      const sectionCount = sectionResults.reduce((sum, r) => {
        return r.status === "fulfilled" ? sum + (r.value?.length || 0) : sum
      }, 0)

      return { profile, students, teachers, accountants, classes: classes.length, sections: sectionCount }
    } catch (error) {
      console.error("Dashboard stats error:", error)
      throw error
    }
  },
}