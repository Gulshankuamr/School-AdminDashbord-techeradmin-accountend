import React, { useState, useEffect } from 'react'
import { Save, BarChart2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { markExameService } from '../../services/examService/markExameService'

const AssignMarks = () => {
  const navigate = useNavigate()

  // ─── Dropdown Source Data ─────────────────────────────────────
  const [examList,      setExamList]      = useState([])
  const [classList,     setClassList]     = useState([])
  const [sectionList,   setSectionList]   = useState([])
  const [timetableList, setTimetableList] = useState([])

  // subjects derived from timetable rows (unique by subject_id)
  const subjectList = timetableList.filter(
    (t, i, arr) => arr.findIndex((x) => String(x.subject_id) === String(t.subject_id)) === i
  )

  // ─── Selected Filter Values ───────────────────────────────────
  const [selectedExam,    setSelectedExam]    = useState('')
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  // ─── Matched timetable row ────────────────────────────────────
  const [matchedTimetable, setMatchedTimetable] = useState(null)
  const [examData, setExamData] = useState({
    maxMarks: 100, minPass: 33,
    date: '', startTime: '', endTime: '', roomNo: '',
  })

  // ─── Students & Stats ─────────────────────────────────────────
  const [students, setStudents] = useState([])
  const [stats, setStats]       = useState({ total: 0, present: 0, absent: 0, average: '0.0' })

  // ─── UI State ─────────────────────────────────────────────────
  const [loadingInit,      setLoadingInit]      = useState(false)
  const [loadingSections,  setLoadingSections]  = useState(false)
  const [loadingTimetable, setLoadingTimetable] = useState(false)
  const [loadingStudents,  setLoadingStudents]  = useState(false)
  const [saving,           setSaving]           = useState(false)
  const [message,          setMessage]          = useState({ type: '', text: '' })

  // ═══════════════════════════════════════════════════════════════
  // INIT: fetch exams + classes
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true)
      try {
        const [examRes, classRes] = await Promise.all([
          markExameService.getExams(),
          markExameService.getAllClassList(),
        ])
        setExamList(examRes.data   || [])
        setClassList(classRes.data || [])
      } catch (err) {
        console.error('Init error:', err)
        setMessage({ type: 'error', text: 'Failed to load initial data. Please refresh.' })
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // CLASS changes → fetch sections, reset downstream
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    setSelectedSection('')
    setSelectedSubject('')
    setTimetableList([])
    setMatchedTimetable(null)
    setStudents([])
    setSectionList([])
    if (!selectedClass) return
    const fetch_ = async () => {
      setLoadingSections(true)
      try {
        const res = await markExameService.getAllSections(selectedClass)
        setSectionList(res.data || [])
      } catch (err) {
        console.error('Sections error:', err)
        setSectionList([])
      } finally {
        setLoadingSections(false)
      }
    }
    fetch_()
  }, [selectedClass])

  // ═══════════════════════════════════════════════════════════════
  // EXAM + CLASS + SECTION → fetch timetable → populates subjects
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    setSelectedSubject('')
    setTimetableList([])
    setMatchedTimetable(null)
    if (!selectedExam || !selectedClass || !selectedSection) return
    const fetch_ = async () => {
      setLoadingTimetable(true)
      try {
        const res = await markExameService.getExamTimetable(
          selectedExam, selectedClass, selectedSection
        )
        setTimetableList(res.data || [])
      } catch (err) {
        console.error('Timetable error:', err)
        setTimetableList([])
      } finally {
        setLoadingTimetable(false)
      }
    }
    fetch_()
  }, [selectedExam, selectedClass, selectedSection])

  // ═══════════════════════════════════════════════════════════════
  // SUBJECT changes → match timetable row → fill exam details
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!selectedSubject || timetableList.length === 0) {
      setMatchedTimetable(null)
      return
    }
    const match = timetableList.find(
      (t) => String(t.subject_id) === String(selectedSubject)
    )
    if (match) {
      setMatchedTimetable(match)
      const rawDate = match.exam_date
        ? new Date(match.exam_date).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
          })
        : ''
      setExamData({
        // ✅ FIX: parseFloat for max_marks & min_passing_marks (API returns strings)
        maxMarks:  parseFloat(match.max_marks)         || 100,
        minPass:   parseFloat(match.min_passing_marks) || 33,
        date:      rawDate,
        startTime: match.start_time || '',
        endTime:   match.end_time   || '',
        roomNo:    match.room_no    || '',
      })
    } else {
      setMatchedTimetable(null)
    }
  }, [selectedSubject, timetableList])

  // ═══════════════════════════════════════════════════════════════
  // LOAD STUDENTS
  // ═══════════════════════════════════════════════════════════════
  const handleLoadStudents = async () => {
    if (!selectedClass)   return setMessage({ type: 'error', text: 'Please select a class.' })
    if (!selectedExam)    return setMessage({ type: 'error', text: 'Please select an exam.' })
    if (!selectedSection) return setMessage({ type: 'error', text: 'Please select a section.' })

    setLoadingStudents(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await markExameService.getStudentsByClass(selectedClass, selectedSection)
      const raw = res.data || []

      const mapped = raw.map((item) => ({
        id:         item.student_id,
        student_id: item.student_id,
        name:       item.name        || item.student_name || `Student ${item.student_id}`,
        rollNo:     item.roll_no     || item.admission_no || item.student_id,
        marks:      0,
        is_absent:  false,
        status:     'ABSENT',
        remark:     '',
        avatar:     item.avatar      || item.profile_image || item.photo || null,
      }))

      setStudents(mapped)
      computeStats(mapped)

      if (mapped.length === 0)
        setMessage({ type: 'error', text: 'No students found for selected class/section.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load students.' })
    } finally {
      setLoadingStudents(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════
  const computeStatus = (marks, isAbsent) => {
    if (isAbsent) return 'ABSENT'
    if (!marks || marks === 0) return 'FAIL'
    return marks >= examData.minPass ? 'PASS' : 'FAIL'
  }

  // ✅ FIX: average ab actual maxMarks use karta hai
  const computeStats = (list) => {
    const total   = list.length
    const absent  = list.filter((s) => s.is_absent).length
    const present = total - absent
    const presentStudents = list.filter((s) => !s.is_absent)
    const totalMarks = presentStudents.reduce((sum, s) => sum + (s.marks || 0), 0)
    const totalMax   = presentStudents.reduce((sum, s) => sum + examData.maxMarks, 0)
    const avg = present > 0 && totalMax > 0
      ? ((totalMarks / totalMax) * 100).toFixed(1)
      : '0.0'
    setStats({ total, present, absent, average: avg })
  }

  const handleMarksChange = (studentId, value) => {
    // ✅ FIX: parseInt se NaN aata tha empty string pe — Number() use karo
    let marks = Number(value)
    if (isNaN(marks) || marks < 0) marks = 0
    marks = Math.min(marks, examData.maxMarks)
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, marks, status: computeStatus(marks, s.is_absent) } : s
    )
    setStudents(updated)
    computeStats(updated)
  }

  const handleAbsentToggle = (studentId) => {
    const updated = students.map((s) => {
      if (s.id !== studentId) return s
      const newAbsent = !s.is_absent
      return {
        ...s,
        is_absent: newAbsent,
        marks:     newAbsent ? 0 : s.marks,
        status:    computeStatus(newAbsent ? 0 : s.marks, newAbsent),
      }
    })
    setStudents(updated)
    computeStats(updated)
  }

  const handleRemarkChange = (studentId, remark) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, remark } : s)))
  }

  // ═══════════════════════════════════════════════════════════════
  // SAVE ALL
  // ═══════════════════════════════════════════════════════════════
  const handleSaveAll = async () => {
    if (!matchedTimetable)
      return setMessage({ type: 'error', text: 'No timetable matched. Select exam, class, section & subject.' })
    if (students.length === 0)
      return setMessage({ type: 'error', text: 'No students loaded.' })

    // ✅ FIX: present students with 0 marks ko properly validate karo
    const invalid = students.filter((s) => !s.is_absent && (s.marks === 0 || s.marks === ''))
    if (invalid.length > 0)
      return setMessage({
        type: 'error',
        text: `${invalid.length} present student(s) have 0 marks. Enter marks or mark as absent.`,
      })

    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const result = await markExameService.saveAllMarks(students, matchedTimetable.timetable_id)
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.success
          ? `✅ ${result.message}`
          : `⚠️ ${result.message}${result.errors?.length ? ` — Failed IDs: ${result.errors.map((e) => e.studentId).join(', ')}` : ''}`,
      })
      // ✅ FIX: success ke baad auto scroll to top
      if (result.success) window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save marks.' })
    } finally {
      setSaving(false)
    }
  }

  // ─── Style helpers ────────────────────────────────────────────
  const statusColor = (s) => ({
    PASS:   'text-green-600  bg-green-50  border border-green-200',
    FAIL:   'text-red-600    bg-red-50    border border-red-200',
    ABSENT: 'text-orange-600 bg-orange-50 border border-orange-200',
  }[s] || '')

  const marksInputBorder = (s) => ({
    PASS:   'border-green-400 focus:ring-green-200',
    FAIL:   'border-red-400   focus:ring-red-200',
    ABSENT: 'border-gray-200  bg-gray-100 cursor-not-allowed',
  }[s] || 'border-gray-300')

  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')

  const avatarBg = (name = '') => {
    const c = ['bg-blue-500','bg-violet-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-rose-500','bg-amber-500','bg-cyan-500']
    return c[(name.charCodeAt(0) || 0) % c.length]
  }

  const selectCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'

  // ─── Pass/Fail counts for quick summary ──────────────────────
  const passCount = students.filter((s) => s.status === 'PASS').length
  const failCount = students.filter((s) => s.status === 'FAIL').length

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✏️ Exam Marks Entry</h1>
          <p className="text-gray-500 text-sm mt-1">
            Select exam and class details to manage student performance.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/exams/marks-list')}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
        >
          View Mark List
        </button>
      </div>

      {/* ── Alert ── */}
      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        {loadingInit ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading exam data...</p>
        ) : (
          <div className="flex flex-wrap gap-4 items-end">

            {/* 1. SELECT EXAM */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">Select Exam</label>
              <select
                className={`${selectCls} min-w-[200px]`}
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value)
                  setStudents([])
                  setMatchedTimetable(null)
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">-- Select Exam --</option>
                {examList.map((exam) => (
                  <option key={exam.exam_id} value={exam.exam_id}>
                    {exam.exam_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. CLASS */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">Class</label>
              <select
                className={`${selectCls} min-w-[130px]`}
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">-- Select Class --</option>
                {classList.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. SECTION */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">Section</label>
              <select
                className={`${selectCls} min-w-[130px]`}
                value={selectedSection}
                disabled={!selectedClass || loadingSections}
                onChange={(e) => {
                  setSelectedSection(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">
                  {loadingSections ? 'Loading...' : '-- Select Section --'}
                </option>
                {sectionList.map((sec) => (
                  <option key={sec.section_id} value={sec.section_id}>
                    {sec.section_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. SUBJECT */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wide">Subject</label>
              <select
                className={`${selectCls} min-w-[150px]`}
                value={selectedSubject}
                disabled={!selectedSection || loadingTimetable}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setStudents([])
                  setMessage({ type: '', text: '' })
                }}
              >
                <option value="">
                  {loadingTimetable
                    ? 'Loading subjects...'
                    : subjectList.length === 0 && selectedSection && !loadingTimetable
                    ? 'No subjects found'
                    : '-- Select Subject --'}
                </option>
                {subjectList.map((sub) => (
                  <option key={sub.subject_id} value={sub.subject_id}>
                    {sub.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. LOAD STUDENTS */}
            <button
              onClick={handleLoadStudents}
              disabled={loadingStudents || !selectedClass || !selectedExam || !selectedSection}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={15} />
              {loadingStudents ? 'Loading...' : 'Load Students'}
            </button>
          </div>
        )}
      </div>

      {/* ── Exam Details Bar ── */}
      {matchedTimetable && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-black text-sm">Exam Details:</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Max Marks: {examData.maxMarks}
            </span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
              Min Pass: {examData.minPass}
            </span>
            {examData.date && (
              <span className="text-black text-xs font-medium">📅 {examData.date}</span>
            )}
            {examData.startTime && examData.endTime && (
              <span className="text-black text-xs font-medium">
                🕙 {examData.startTime} – {examData.endTime}
              </span>
            )}
            {examData.roomNo && (
              <span className="text-black text-xs font-medium">🚪 Room: {examData.roomNo}</span>
            )}
          </div>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            <BarChart2 size={16} /> View Subject Analytics
          </button>
        </div>
      )}

      {/* ── No timetable warning ── */}
      {selectedExam && selectedClass && selectedSection && !loadingTimetable && timetableList.length === 0 && (
        <div className="mb-5 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 font-medium">
          ⚠️ No timetable entries found for this exam + class + section combination.
          Students can still be loaded but exam details won't be prefilled.
        </div>
      )}

      {/* ── Students Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">

        {/* Table Header */}
        <div className="grid grid-cols-[80px_1fr_220px_100px_1fr] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-black uppercase tracking-wide">
          <span>Roll No</span>
          <span>Student Name</span>
          <span>Marks Obtained ({examData.maxMarks} max)</span>
          <span>Absent</span>
          <span>Remarks / Comments</span>
        </div>

        {/* Empty State */}
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📋</span>
            <p className="text-gray-400 text-sm text-center">
              {loadingStudents
                ? 'Loading students...'
                : !selectedExam
                ? 'Step 1: Select an exam'
                : !selectedClass
                ? 'Step 2: Select a class'
                : !selectedSection
                ? 'Step 3: Select a section'
                : 'Click "Load Students" to load the student list'}
            </p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className={`grid grid-cols-[80px_1fr_220px_100px_1fr] gap-4 items-center px-6 py-4 border-b border-gray-50 transition-colors ${
                student.is_absent ? 'bg-red-50/40' : 'hover:bg-gray-50'
              }`}
            >
              {/* Roll No */}
              <span className="text-sm font-bold text-black">{student.rollNo}</span>

              {/* Student Name + Avatar */}
              <div className="flex items-center gap-3">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarBg(student.name)}`}>
                    {initials(student.name)}
                  </div>
                )}
                <span className="text-sm font-medium text-black truncate">{student.name}</span>
              </div>

              {/* Marks Input + Status Badge */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={student.marks}
                  disabled={student.is_absent}
                  onChange={(e) => handleMarksChange(student.id, e.target.value)}
                  className={`w-20 border rounded-lg px-3 py-1.5 text-sm text-center text-black font-semibold focus:outline-none focus:ring-2 transition-all ${marksInputBorder(student.status)}`}
                  min="0"
                  max={examData.maxMarks}
                  placeholder="0"
                />
                {/* ✅ FIX: percentage bhi dikhao */}
                {!student.is_absent && student.marks > 0 && (
                  <span className="text-xs text-gray-400 font-medium">
                    {((student.marks / examData.maxMarks) * 100).toFixed(0)}%
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${statusColor(student.status)}`}>
                  {student.status}
                </span>
              </div>

              {/* Absent Toggle */}
              <div className="flex items-center">
                <button
                  onClick={() => handleAbsentToggle(student.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    student.is_absent ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                  title={student.is_absent ? 'Mark as Present' : 'Mark as Absent'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      student.is_absent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Remark */}
              {student.is_absent ? (
                <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                  ABSENT – NO MARK ENTRY
                </span>
              ) : (
                <input
                  type="text"
                  placeholder="Add remark..."
                  value={student.remark}
                  onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Stats + Save Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-8 text-sm flex-wrap">
          <div>
            <span className="text-gray-500 font-medium">TOTAL</span>
            <span className="ml-2 font-bold text-black">{stats.total}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">PRESENT</span>
            <span className="ml-2 font-bold text-green-600">{stats.present}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">ABSENT</span>
            <span className="ml-2 font-bold text-orange-500">
              {String(stats.absent).padStart(2, '0')}
            </span>
          </div>
          {/* ✅ FIX: Pass/Fail counts bhi dikhao */}
          <div>
            <span className="text-gray-500 font-medium">PASS</span>
            <span className="ml-2 font-bold text-green-600">{passCount}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">FAIL</span>
            <span className="ml-2 font-bold text-red-500">{failCount}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">CLASS AVG</span>
            <span className="ml-2 font-bold text-blue-600">{stats.average}%</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 text-sm font-medium">
            <BarChart2 size={16} /> View Report
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'SAVE ALL MARKS'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default AssignMarks