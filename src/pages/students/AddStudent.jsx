import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, CheckCircle, User, Mail, Lock, Users, BookOpen, Layers,
  Phone, MapPin, Calendar, Heart, GraduationCap, Hash, DollarSign, Eye, EyeOff,
  IdCard, X, Shield, Briefcase, AlertCircle, Building2, Home, ChevronDown,
  Search, UserCheck
} from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'
import { SectionDropdown } from './Sectiondropdown'

/**
 * Section field contract:
 *  formData.section_id  → sent to backend  ✅  e.g. 134
 *  display_name         → only in UI       ✅  never in formData
 */
const AddStudent = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '', user_email: '', password: '', roll_no: '', gender: '',
    class_id: '',
    section_id: '',
    academic_year: '', dob: '', mobile_number: '',
    religion: '', blood_group: '', category: '', passed_out: '0', transfer: '0',
    father_name: '', father_mobile: '', father_occupation: '',
    mother_name: '', mother_mobile: '', mother_occupation: '',
    guardian_name: '', emergency_contact_number: '',
    address: '', city: '', state: '', pincode: '',
    aadhar_number: '',
    selected_fee_heads: [],
    student_photo: null, aadhar_card: null, father_photo: null, mother_photo: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    student_photo: null, aadhar_card: null, father_photo: null, mother_photo: null,
  })

  const [successInfo, setSuccessInfo]         = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [showPassword, setShowPassword]       = useState(false)
  const [error, setError]                     = useState(null)

  // Students list above form
  const [students, setStudents]               = useState([])
  const [showStudents, setShowStudents]       = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentSearch, setStudentSearch]     = useState('')
  const studentsRef                           = useRef(null)

  const [classes, setClasses]                 = useState([])
  const [sections, setSections]               = useState([])
  const [feeHeads, setFeeHeads]               = useState([])
  const [loadingClasses, setLoadingClasses]   = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [loadingFeeHeads, setLoadingFeeHeads] = useState(false)

  useEffect(() => {
    const run = async () => {
      try { setLoadingClasses(true); const d = await studentService.getAllClasses(); setClasses(Array.isArray(d) ? d : []) }
      catch (e) { console.error(e); setClasses([]) }
      finally { setLoadingClasses(false) }
    }; run()
  }, [])

  useEffect(() => {
    const run = async () => {
      try { setLoadingFeeHeads(true); const d = await studentService.getAllFeeHeads(); setFeeHeads(Array.isArray(d) ? d : []) }
      catch (e) { console.error(e); setFeeHeads([]) }
      finally { setLoadingFeeHeads(false) }
    }; run()
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!formData.class_id) { setSections([]); return }
      try {
        setLoadingSections(true)
        const d = await studentService.getSectionsByClassId(formData.class_id)
        setSections(Array.isArray(d) ? d : [])
      } catch (e) { console.error(e); setSections([]) }
      finally { setLoadingSections(false) }
    }; run()
  }, [formData.class_id])

  // ── Fetch students list ──────────────────────────────────────────────────
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      const d = await studentService.getAllStudents()
      setStudents(Array.isArray(d) ? d : [])
    } catch (e) {
      console.error(e)
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleToggleStudents = async () => {
    if (!showStudents && students.length === 0) {
      await fetchStudents()
    }
    setShowStudents(prev => !prev)
    if (!showStudents) {
      setTimeout(() => studentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'class_id') {
      setFormData(prev => ({ ...prev, class_id: value, section_id: '' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSectionChange = (sectionId, _sectionName) => {
    setFormData(prev => ({ ...prev, section_id: sectionId }))
  }

  const handleFeeHeadToggle = (feeHeadId) => {
    const numId = Number(feeHeadId)
    setFormData(prev => {
      const cur = prev.selected_fee_heads
      return cur.includes(numId)
        ? { ...prev, selected_fee_heads: cur.filter(x => x !== numId) }
        : { ...prev, selected_fee_heads: [...cur, numId] }
    })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData(prev => ({ ...prev, [name]: file }))
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setFilePreviews(prev => ({ ...prev, [name]: reader.result }))
        reader.readAsDataURL(file)
      } else {
        setFilePreviews(prev => ({ ...prev, [name]: file.name }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '', user_email: '', password: '', roll_no: '', gender: '',
      class_id: '', section_id: '', academic_year: '', dob: '', mobile_number: '',
      religion: '', blood_group: '', category: '', passed_out: '0', transfer: '0',
      father_name: '', father_mobile: '', father_occupation: '',
      mother_name: '', mother_mobile: '', mother_occupation: '',
      guardian_name: '', emergency_contact_number: '',
      address: '', city: '', state: '', pincode: '', aadhar_number: '',
      selected_fee_heads: [],
      student_photo: null, aadhar_card: null, father_photo: null, mother_photo: null,
    })
    setFilePreviews({ student_photo: null, aadhar_card: null, father_photo: null, mother_photo: null })
    setSections([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const submitData = {
        ...formData,
        selected_fee_heads: JSON.stringify(formData.selected_fee_heads),
      }
      const response = await studentService.addStudent(submitData)
      console.log('✅ addStudent response:', response)
      const studentName = formData.name
      resetForm()
      setSuccessInfo({ name: studentName })

      // ── AUTO DISMISS after 1000ms ──
      setTimeout(() => setSuccessInfo(null), 1000)

      // Refresh students list if it's open / was loaded before
      fetchStudents()
      setShowStudents(true)
      setTimeout(() => studentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)

    } catch (err) {
      console.error('Error adding student:', err)
      setError(err?.message || 'Failed to add student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s =>
    !studentSearch ||
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll_no?.toString().includes(studentSearch) ||
    s.user_email?.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const inp = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
  const sel = "w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 text-sm appearance-none cursor-pointer"
  const ico = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
  const ChevDown = () => (
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )

  const SectionHeader = ({ icon: Icon, label, color = 'blue', subtitle }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600', purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600', indigo: 'bg-indigo-50 text-indigo-600',
    }
    return (
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${colors[color]}`}><Icon className="w-4 h-4" /></div>
        <div>
          <h2 className="font-semibold text-gray-800 text-base">{label}</h2>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 lg:px-6">

      {/* Error Toast */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slideIn">
          <div className="bg-white border border-red-200 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-red-500 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-sm">Error</span>
              </div>
              <button onClick={() => setError(null)} className="text-white hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast — auto-dismisses in 1s */}
      {successInfo && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slideIn">
          <div className="bg-white border border-green-200 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-green-500 px-4 py-2.5 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Student Added!</span>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm">
                <span className="font-bold">{successInfo.name}</span> enrolled successfully.
              </p>
              {/* Progress bar showing 1s auto-dismiss */}
              <div className="mt-2 h-1 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full animate-shrink" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span>/</span>
            <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/admin/students')}>Students</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Enroll New Student</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/students')} className="p-2 bg-white hover:bg-gray-100 rounded-lg transition border border-gray-200 group">
              <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Enroll New Student</h1>
              <p className="text-gray-500 text-sm">Fill in details to register a new student</p>
            </div>
            {/* View Students Toggle Button */}
            <button
              type="button"
              onClick={handleToggleStudents}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                showStudents
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>All Students</span>
              {students.length > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${showStudents ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {students.length}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStudents ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Students List Panel (above form) ─────────────────────────── */}
        {showStudents && (
          <div ref={studentsRef} className="mb-5 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 rounded-lg"><UserCheck className="w-4 h-4 text-blue-600" /></div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800 text-base">All Students</h2>
                <p className="text-xs text-gray-400">{students.length} total students enrolled</p>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-gray-50 w-44"
                />
              </div>
              <button onClick={() => setShowStudents(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingStudents ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Loading students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                {studentSearch ? 'No students match your search.' : 'No students enrolled yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {['#', 'Name', 'Roll No', 'Email', 'Class', 'Gender', 'Mobile'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 border-b border-gray-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <tr key={s.student_id || i} className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-bold text-xs">{s.name?.charAt(0)?.toUpperCase() || '?'}</span>
                            </div>
                            <span className="font-medium text-gray-800">{s.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{s.roll_no || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500 max-w-[160px] truncate">{s.user_email || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{s.class_name || s.class_id || '—'}</td>
                        <td className="px-4 py-2.5">
                          {s.gender ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.gender === 'Male' ? 'bg-blue-50 text-blue-600' : s.gender === 'Female' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                              {s.gender}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{s.mobile_number || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Basic Information ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader icon={User} label="Basic Information" color="blue" />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inp} required placeholder="Student's full name" /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} className={inp} required placeholder="student@example.com" /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={ico}><Lock className="h-4 w-4 text-gray-400" /></div>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                    required placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Roll Number</label>
                <div className="relative"><div className={ico}><Hash className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} className={inp} placeholder="e.g., 01" /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Academic Year <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><GraduationCap className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} className={inp} required placeholder="2025-26" /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inp} required /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inp} required placeholder="Enter mobile number" /></div>
              </div>

              {/* Class */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className={ico}><BookOpen className="h-4 w-4 text-gray-400" /></div>
                  <select name="class_id" value={formData.class_id} onChange={handleChange} className={sel} required disabled={loadingClasses}>
                    <option value="">{loadingClasses ? 'Loading...' : 'Select Class'}</option>
                    {classes.map(cls => <option key={cls.class_id} value={cls.class_id}>{cls.class_name || `Class ${cls.class_id}`}</option>)}
                  </select>
                  <ChevDown />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Section <span className="text-red-400">*</span>
                </label>
                <SectionDropdown
                  sections={sections}
                  value={formData.section_id}
                  onChange={handleSectionChange}
                  disabled={!formData.class_id}
                  loading={loadingSections}
                  placeholder={!formData.class_id ? 'Select class first' : 'Select Section'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><Users className="h-4 w-4 text-gray-400" /></div>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={sel} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select><ChevDown /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Blood Group</label>
                <div className="relative"><div className={ico}><Heart className="h-4 w-4 text-gray-400" /></div>
                  <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={sel}>
                    <option value="">Select Blood Group</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select><ChevDown /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <div className="relative"><div className={ico}><Users className="h-4 w-4 text-gray-400" /></div>
                  <select name="category" value={formData.category} onChange={handleChange} className={sel}>
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select><ChevDown /></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Religion</label>
                <div className="relative"><div className={ico}><Heart className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inp} placeholder="e.g., Hindu, Muslim" /></div>
              </div>

            </div>
          </div>

          {/* ── Identity ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Shield} label="Identity Information" color="indigo" subtitle="Aadhaar and ID details" />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Number</label>
                <div className="relative"><div className={ico}><IdCard className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} className={inp} placeholder="12-digit Aadhaar number" maxLength={12} /></div>
              </div>
            </div>
          </div>

          {/* ── Address ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Home} label="Address Information" color="orange" />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 text-sm resize-none"
                    required placeholder="Enter complete address" />
                </div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
                <div className="relative"><div className={ico}><Building2 className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className={inp} placeholder="City" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
                <div className="relative"><div className={ico}><MapPin className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className={inp} placeholder="State" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Pincode</label>
                <div className="relative"><div className={ico}><Hash className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inp} placeholder="6-digit pincode" maxLength={6} /></div></div>
            </div>
          </div>

          {/* ── Family & Contact ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Users} label="Family & Contact Information" color="green" />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inp} required placeholder="Father's full name" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Mobile</label>
                <div className="relative"><div className={ico}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="father_mobile" value={formData.father_mobile} onChange={handleChange} className={inp} placeholder="Father's mobile number" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Occupation</label>
                <div className="relative"><div className={ico}><Briefcase className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="father_occupation" value={formData.father_occupation} onChange={handleChange} className={inp} placeholder="e.g., Business" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Mother's Name <span className="text-red-400">*</span></label>
                <div className="relative"><div className={ico}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={inp} required placeholder="Mother's full name" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Mother's Mobile</label>
                <div className="relative"><div className={ico}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="mother_mobile" value={formData.mother_mobile} onChange={handleChange} className={inp} placeholder="Mother's mobile number" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Mother's Occupation</label>
                <div className="relative"><div className={ico}><Briefcase className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} className={inp} placeholder="e.g., Homemaker" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Guardian Name</label>
                <div className="relative"><div className={ico}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} className={inp} placeholder="Guardian's full name" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Emergency Contact</label>
                <div className="relative"><div className={ico}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} className={inp} placeholder="Emergency contact number" /></div></div>
            </div>
          </div>

          {/* ── Fee Heads ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="p-1.5 bg-yellow-50 rounded-lg"><DollarSign className="w-4 h-4 text-yellow-600" /></div>
              <h2 className="font-semibold text-gray-800 text-base">Fee Heads</h2>
              {formData.selected_fee_heads.length > 0 && (
                <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {formData.selected_fee_heads.length} Selected
                </span>
              )}
            </div>
            <div className="p-5">
              {loadingFeeHeads ? <p className="text-sm text-gray-400">Loading fee heads...</p>
                : feeHeads.length === 0 ? <p className="text-sm text-gray-400 italic">No fee heads available</p>
                : (
                  <div className="flex flex-wrap gap-3">
                    {feeHeads.map((fh) => {
                      const isChecked = formData.selected_fee_heads.includes(Number(fh.fee_head_id))
                      return (
                        <label key={fh.fee_head_id}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all select-none text-sm font-medium ${
                            isChecked ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-yellow-300'
                          }`}>
                          <input type="checkbox" className="hidden" checked={isChecked} onChange={() => handleFeeHeadToggle(fh.fee_head_id)} />
                          <span className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${isChecked ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300 bg-white'}`}>
                            {isChecked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </span>
                          <DollarSign className="w-3.5 h-3.5 text-yellow-600" />
                          {fh.head_name || `Fee Head #${fh.fee_head_id}`}
                        </label>
                      )
                    })}
                  </div>
                )}
            </div>
          </div>

          {/* ── Documents ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Upload} label="Documents & Photos" color="purple" subtitle="JPG, PNG or PDF accepted" />
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Student Photo',  name: 'student_photo', accept: 'image/*' },
                { label: 'Aadhar Card',    name: 'aadhar_card',   accept: 'image/*,.pdf' },
                { label: "Father's Photo", name: 'father_photo',  accept: 'image/*' },
                { label: "Mother's Photo", name: 'mother_photo',  accept: 'image/*' },
              ].map((file) => (
                <div key={file.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{file.label}</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/20 transition-all bg-gray-50/50 min-h-[140px] flex flex-col justify-center">
                    <input type="file" name={file.name} id={file.name} onChange={handleFileChange} accept={file.accept} className="hidden" />
                    <label htmlFor={file.name} className="cursor-pointer flex flex-col items-center justify-center h-full p-3">
                      {filePreviews[file.name] ? (
                        typeof filePreviews[file.name] === 'string' && filePreviews[file.name].startsWith('data:') ? (
                          <><img src={filePreviews[file.name]} alt="Preview" className="w-16 h-16 object-cover rounded-lg mb-2 shadow border border-blue-200" />
                            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Uploaded</span></>
                        ) : (
                          <><div className="bg-green-100 rounded-full p-2 mb-2"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                            <span className="text-xs text-green-600 font-semibold text-center break-all">{filePreviews[file.name]}</span></>
                        )
                      ) : (
                        <><div className="bg-blue-100 rounded-full p-3 mb-2"><Upload className="w-5 h-5 text-blue-500" /></div>
                          <span className="text-xs text-gray-600 font-medium text-center">Click to upload</span>
                          <span className="text-xs text-gray-400 text-center mt-0.5">JPG, PNG{file.accept.includes('pdf') ? ', PDF' : ''}</span></>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6">
            <button type="button" onClick={() => navigate('/admin/students')}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm order-2 sm:order-1">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 order-1 sm:order-2 shadow-sm hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? (
                <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg><span>Adding...</span></>
              ) : (
                <><CheckCircle className="w-4 h-4" /><span>Add Student</span></>
              )}
            </button>
          </div>

        </form>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        /* Progress bar shrinks from full width to 0 in exactly 1s */
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-fadeIn  { animation: fadeIn  0.25s ease-out; }
        .animate-shrink  { animation: shrink 1s linear forwards; }
      `}</style>
    </div>
  )
}

export default AddStudent