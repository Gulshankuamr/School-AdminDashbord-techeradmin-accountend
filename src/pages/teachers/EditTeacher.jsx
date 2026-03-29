import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Upload, Save, User, Mail, Lock, Phone, MapPin,
  GraduationCap, Briefcase, Calendar, Users, CheckCircle, X, Eye, EyeOff,
  Hash, BadgeCheck, Building2
} from 'lucide-react'
import { teacherService } from '../../services/teacherService/teacherService'

// ✅ FIX 1: Components moved OUTSIDE to prevent focus loss on re-render
const iconWrap = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"

const ChevronDownIcon = () => (
  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
)

const FieldLabel = ({ label, required, hint }) => (
  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
    {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
    {hint && <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">({hint})</span>}
  </label>
)

// ✅ FIX 2: formatDate defined as a standalone function (was the main bug)
const formatDate = (d) => {
  if (!d) return ''
  if (typeof d === 'string' && d.includes('T')) {
    return d.split('T')[0] // "2012-10-04T18:30:00.000Z" → "2012-10-04"
  }
  const date = new Date(d)
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
}

const EditTeacher = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    teacher_id: '',
    name: '',
    user_email: '',
    password: '',
    gender: '',
    qualification: '',
    experience_years: '',
    joining_date: '',
    mobile_number: '',
    address: '',
    father_name: '',
    mother_name: '',
    employee_id: '',
    dob: '',
    employment_type: '',
    designation: '',
    teacher_photo: null,
    aadhar_card: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    teacher_photo: null,
    aadhar_card: null,
  })

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return
      try {
        setFetching(true)
        const data = await teacherService.getTeacherById(id)
        if (!data) throw new Error('Teacher data is empty')

        // ✅ FIX 3: Now using the correctly named formatDate function
        setFormData({
          teacher_id: String(data.teacher_id || id),
          name: data.name || '',
          user_email: data.user_email || '',
          password: '',
          gender: data.gender || '',
          qualification: data.qualification || '',
          experience_years: data.experience_years != null ? String(data.experience_years) : '',
          joining_date: formatDate(data.joining_date),
          mobile_number: data.mobile_number || '',
          address: data.address || '',
          father_name: data.father_name || '',
          mother_name: data.mother_name || '',
          employee_id: data.employee_id || '',
          dob: formatDate(data.dob),
          employment_type: data.employment_type || '',
          designation: data.designation || '',
          teacher_photo: null,
          aadhar_card: null,
        })

        setFilePreviews({
          teacher_photo: data.teacher_photo_url || null,
          aadhar_card: data.aadhar_card_url || null,
        })
      } catch (err) {
        setError(err.message || 'Failed to load teacher data')
      } finally {
        setFetching(false)
      }
    }
    fetchTeacher()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB')
        setTimeout(() => setError(null), 3000)
        return
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!formData.teacher_id) throw new Error('Teacher ID missing')
      if (!formData.employee_id || !String(formData.employee_id).trim()) {
        throw new Error('Employee ID is required')
      }

      const payload = {
        teacher_id: formData.teacher_id,
        name: formData.name || '',
        user_email: formData.user_email || '',
        gender: formData.gender || '',
        qualification: formData.qualification || '',
        experience_years: formData.experience_years || '',
        joining_date: formData.joining_date || '',
        mobile_number: formData.mobile_number || '',
        address: formData.address || '',
        father_name: formData.father_name || '',
        mother_name: formData.mother_name || '',
        employee_id: formData.employee_id || '',
        dob: formData.dob || '',
        employment_type: formData.employment_type || '',
        designation: formData.designation || '',
      }

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password
      }
      if (formData.teacher_photo instanceof File) payload.teacher_photo = formData.teacher_photo
      if (formData.aadhar_card instanceof File) payload.aadhar_card = formData.aadhar_card

      await teacherService.updateTeacher(formData.teacher_id, payload)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        navigate('/admin/teachers')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to update teacher')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = "w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
  const selectBase = "w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 appearance-none cursor-pointer"

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-5">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-gray-600 font-semibold">Loading teacher data...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 py-6 px-3 sm:px-4 lg:px-6">

      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
          <div className="bg-white border border-red-100 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2.5 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Update Failed</span>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4"><p className="text-gray-700 text-sm">{error}</p></div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
          <div className="bg-white border border-emerald-100 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">Updated Successfully!</span>
              </div>
              <button onClick={() => setSaveSuccess(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        </div>
      )}

      <div className="w-full">

        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <span className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => navigate('/admin/teachers')}>Teachers</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-semibold">Edit Teacher</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/teachers')}
              className="p-2.5 bg-white hover:bg-emerald-50 rounded-xl transition border border-gray-200 hover:border-emerald-200 group shadow-sm">
              <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 transition-colors" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Teacher</h1>
              <p className="text-gray-400 text-sm mt-0.5">Update teacher information and documents</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl"><User className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">Basic Information</h2>
                <p className="text-xs text-gray-400 mt-0.5">Personal and login details</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <div>
                <FieldLabel label="Full Name" required />
                <div className="relative">
                  <div className={iconWrap}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className={inputBase} required placeholder="Teacher's full name" />
                </div>
              </div>

              <div>
                <FieldLabel label="Email Address" required />
                <div className="relative">
                  <div className={iconWrap}><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input type="email" name="user_email" value={formData.user_email} onChange={handleChange}
                    className={inputBase} required placeholder="teacher@example.com" />
                </div>
              </div>

              <div>
                <FieldLabel label="New Password" hint="leave blank to keep" />
                <div className="relative">
                  <div className={iconWrap}><Lock className="h-4 w-4 text-gray-400" /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    placeholder="Leave blank to keep current"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <FieldLabel label="Employee ID" required />
                <div className="relative">
                  <div className={iconWrap}><Hash className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange}
                    className={inputBase} placeholder="e.g., EMP001" required />
                </div>
              </div>

              <div>
                <FieldLabel label="Gender" />
                <div className="relative">
                  <div className={iconWrap}><Users className="h-4 w-4 text-gray-400" /></div>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={selectBase}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>

              <div>
                <FieldLabel label="Date of Birth" />
                <div className="relative">
                  <div className={iconWrap}><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputBase} />
                </div>
              </div>

              <div>
                <FieldLabel label="Qualification" />
                <div className="relative">
                  <div className={iconWrap}><GraduationCap className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="qualification" value={formData.qualification} onChange={handleChange}
                    className={inputBase} placeholder="e.g., M.Ed, B.Sc" />
                </div>
              </div>

              <div>
                <FieldLabel label="Designation" />
                <div className="relative">
                  <div className={iconWrap}><BadgeCheck className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange}
                    className={inputBase} placeholder="e.g., Assistant Teacher" />
                </div>
              </div>

              <div>
                <FieldLabel label="Employment Type" />
                <div className="relative">
                  <div className={iconWrap}><Building2 className="h-4 w-4 text-gray-400" /></div>
                  <select name="employment_type" value={formData.employment_type} onChange={handleChange} className={selectBase}>
                    <option value="">Select Type</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>

              <div>
                <FieldLabel label="Experience (Years)" />
                <div className="relative">
                  <div className={iconWrap}><Briefcase className="h-4 w-4 text-gray-400" /></div>
                  <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange}
                    className={inputBase} placeholder="e.g., 5" min="0" />
                </div>
              </div>

              <div>
                <FieldLabel label="Joining Date" />
                <div className="relative">
                  <div className={iconWrap}><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className={inputBase} />
                </div>
              </div>

              <div>
                <FieldLabel label="Mobile Number" />
                <div className="relative">
                  <div className={iconWrap}><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange}
                    className={inputBase} placeholder="Enter mobile number" />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <FieldLabel label="Address" />
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                    placeholder="Enter full address" />
                </div>
              </div>

            </div>
          </div>

          {/* Family Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl"><Users className="w-4 h-4 text-blue-600" /></div>
              <h2 className="font-bold text-gray-800 text-sm">Family Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Father's Name" />
                <div className="relative">
                  <div className={iconWrap}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="father_name" value={formData.father_name} onChange={handleChange}
                    className={inputBase} placeholder="Father's full name" />
                </div>
              </div>
              <div>
                <FieldLabel label="Mother's Name" />
                <div className="relative">
                  <div className={iconWrap}><User className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange}
                    className={inputBase} placeholder="Mother's full name" />
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl"><Upload className="w-4 h-4 text-purple-600" /></div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">Documents & Photos</h2>
                <p className="text-xs text-gray-400 mt-0.5">Upload new files to replace existing ones</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: 'Teacher Photo', name: 'teacher_photo', accept: 'image/*' },
                { label: 'Aadhar Card', name: 'aadhar_card', accept: 'image/*,.pdf' },
              ].map(file => (
                <div key={file.name}>
                  <FieldLabel label={file.label} />
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-300 bg-gray-50/50 min-h-[170px] flex flex-col justify-center group">
                    <input type="file" name={file.name} id={`edit-${file.name}`} onChange={handleFileChange}
                      accept={file.accept} className="hidden" />
                    <label htmlFor={`edit-${file.name}`} className="cursor-pointer flex flex-col items-center justify-center h-full p-5">
                      {filePreviews[file.name] ? (
                        (filePreviews[file.name].startsWith('data:') || filePreviews[file.name].startsWith('http')) ? (
                          <div className="flex flex-col items-center gap-2">
                            <img src={filePreviews[file.name]} alt="Preview"
                              className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-emerald-200" />
                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Click to replace</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-xs text-emerald-600 font-semibold text-center break-all max-w-[160px]">{filePreviews[file.name]}</span>
                            <span className="text-xs text-gray-400">Click to replace</span>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors duration-300">
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-gray-600 group-hover:text-emerald-600 transition-colors">Click to upload</p>
                            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG{file.accept.includes('pdf') ? ', PDF' : ''} (Max 5MB)</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6 pt-2">
            <button type="button" onClick={() => navigate('/admin/teachers')}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm hover:border-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <><Save className="w-4 h-4" /> Update Teacher</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditTeacher