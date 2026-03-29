import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit, Trash2, X, Download, User,
  FileText, Users, Copy, CheckCircle,
  Phone, MapPin, GraduationCap, Calendar,
  Hash, BadgeCheck, Building2, Briefcase,
  Mail, Shield
} from 'lucide-react'
import ImageModal from '../../components/ImageModal'

function TeacherDetailsModal({ teacher, onClose, onDelete }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  const handleEdit = () => {
    if (onClose) onClose()
    navigate(`/admin/teachers/edit/${teacher?.teacher_id || teacher?.id}`)
  }

  const handleCopyEmail = () => {
    const email = getEmail()
    if (email) {
      navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openImage = (url, title) => {
    if (url) {
      setSelectedImage(url)
      setSelectedImageTitle(title)
      setImageModalOpen(true)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      // If it's an ISO string like "2012-10-04T18:30:00.000Z", extract date part directly
      // to avoid timezone shifting (e.g., IST +5:30 could shift day back)
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const [year, month, day] = dateString.split('T')[0].split('-')
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return `${day} ${months[parseInt(month) - 1]} ${year}`
      }
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return dateString }
  }

  const getValue = (key) => {
    if (!teacher) return null
    const paths = [
      () => teacher[key],
      () => teacher.data?.[key],
      () => teacher.data?.teacher?.[key],
      () => teacher.teacher?.[key],
      () => teacher.data?.data?.[key],
    ]
    for (const path of paths) {
      const value = path()
      if (value !== undefined && value !== null && value !== '') return value
    }
    return null
  }

  const getTeacherId = () => teacher?.teacher_id || teacher?.id || teacher?.data?.teacher_id
  const getName = () => teacher?.name || teacher?.data?.name || teacher?.data?.teacher?.name || '—'
  const getEmail = () => teacher?.user_email || teacher?.email || teacher?.data?.user_email

  const teacherName = getName()
  const teacherEmail = getEmail()
  const teacherId = getTeacherId()
  const teacherGender = getValue('gender')
  const teacherMobile = getValue('mobile_number')
  const teacherQualification = getValue('qualification')
  const teacherExperience = getValue('experience_years')
  const teacherJoiningDate = getValue('joining_date')
  const teacherFatherName = getValue('father_name')
  const teacherMotherName = getValue('mother_name')
  const teacherAddress = getValue('address')
  // const teacherStatus = getValue('status')
  const teacherEmployeeId = getValue('employee_id')
  const teacherDob = getValue('dob')
  const teacherEmploymentType = getValue('employment_type')
  const teacherDesignation = getValue('designation')
  const teacherPhotoUrl = teacher?.teacher_photo_url || teacher?.photo_url || getValue('teacher_photo_url')
  const aadharCardUrl = teacher?.aadhar_card_url || teacher?.aadhar_url || getValue('aadhar_card_url')

  const joiningDate = formatDate(teacherJoiningDate)
  const dobFormatted = formatDate(teacherDob)

  const formatEmploymentType = (et) => {
    if (!et) return null
    return et.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden w-full">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {teacherPhotoUrl ? (
                <img
                  src={teacherPhotoUrl}
                  alt={teacherName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-lg cursor-pointer hover:opacity-90 transition"
                  onClick={() => openImage(teacherPhotoUrl, 'Teacher Photo')}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg border border-white/30">
                  <span className="text-white text-2xl font-black">
                    {teacherName?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-black text-white">{teacherName}</h2>
                {teacherDesignation && (
                  <p className="text-emerald-100 text-sm font-medium mt-0.5">{teacherDesignation}</p>
                )}
                {/* <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    teacherStatus === 1
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-red-400/30 text-red-100 border border-red-300/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${teacherStatus === 1 ? 'bg-white' : 'bg-red-300'}`}></span>
                    {teacherStatus === 1 ? 'Active' : 'Inactive'}
                  </span>
                  {teacherEmploymentType && (
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">
                      {formatEmploymentType(teacherEmploymentType)}
                    </span>
                  )}
                </div> */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition border border-white/30 backdrop-blur">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              {onDelete && (
                <button onClick={() => onDelete(teacher)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/30 hover:bg-red-400/50 text-white rounded-xl text-xs font-bold transition border border-red-300/30">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
              <button onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white border border-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* Identity & Contact */}
          <Section title="Identity & Contact" icon={User} color="emerald">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoCell label="Employee ID" value={teacherEmployeeId || '—'} />
              <InfoCell label="Gender" value={teacherGender ? teacherGender.charAt(0).toUpperCase() + teacherGender.slice(1).toLowerCase() : '—'} />
              <InfoCell label="Date of Birth" value={dobFormatted || '—'} />
              <InfoCell label="Mobile">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-800">{teacherMobile || '—'}</span>
                </div>
              </InfoCell>
              <InfoCell label="Email">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800 break-all">{teacherEmail || '—'}</span>
                  {teacherEmail && (
                    <button onClick={handleCopyEmail} className="flex-shrink-0 text-gray-400 hover:text-emerald-500 transition">
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </InfoCell>
            </div>
            {teacherAddress && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-800">{teacherAddress}</p>
                </div>
              </div>
            )}
          </Section>

          {/* Professional Details */}
          <Section title="Professional Details" icon={Briefcase} color="blue">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoCell label="Qualification">
                <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {teacherQualification || '—'}
                </span>
              </InfoCell>
              {teacherDesignation && (
                <InfoCell label="Designation">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {teacherDesignation}
                  </span>
                </InfoCell>
              )}
              {teacherEmploymentType && (
                <InfoCell label="Employment Type">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
                    <Building2 className="w-3.5 h-3.5" />
                    {formatEmploymentType(teacherEmploymentType)}
                  </span>
                </InfoCell>
              )}
              <InfoCell label="Experience" value={
                teacherExperience != null
                  ? `${teacherExperience} year${teacherExperience !== 1 ? 's' : ''}`
                  : '—'
              } />
              {joiningDate && <InfoCell label="Joining Date" value={joiningDate} />}
            </div>
          </Section>

          {/* Family Information */}
          {(teacherFatherName || teacherMotherName) && (
            <Section title="Family Information" icon={Users} color="teal">
              <div className="grid grid-cols-2 gap-4">
                <InfoCell label="Father's Name" value={teacherFatherName || '—'} />
                <InfoCell label="Mother's Name" value={teacherMotherName || '—'} />
              </div>
            </Section>
          )}

          {/* Documents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <h3 className="text-sm font-black text-gray-800">Documents & Photos</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocCard label="Teacher Photo" url={teacherPhotoUrl} onView={openImage} title="Teacher Photo" />
              <DocCard label="Aadhaar Card" url={aadharCardUrl} onView={openImage} title="Aadhaar Card" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={() => {
              const urls = [teacherPhotoUrl, aadharCardUrl].filter(Boolean)
              urls.forEach(url => window.open(url, '_blank'))
            }}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-emerald-600 transition"
          >
            <Download className="w-4 h-4" /> Download All Docs
          </button>
          <button onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl text-sm font-bold transition shadow-sm">
            Close Profile
          </button>
        </div>
      </div>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage}
        title={selectedImageTitle}
      />
    </>
  )
}

function Section({ title, icon: Icon, color, children }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    teal: 'bg-teal-100 text-teal-600',
  }
  return (
    <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-black text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoCell({ label, value, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {children || <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>}
    </div>
  )
}

function DocCard({ label, url, onView, title }) {
  const isImage = url && /\.(jpg|jpeg|png|gif|webp|bmp)/i.test(url)
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <div
        onClick={() => url && onView(url, title)}
        className={`h-32 rounded-xl border-2 overflow-hidden flex items-center justify-center transition-all duration-200 ${
          url
            ? 'cursor-pointer border-gray-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100'
            : 'border-dashed border-gray-200 bg-gray-50/80'
        }`}
      >
        {url ? (
          isImage ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gray-50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 font-semibold">PDF Document</p>
              <p className="text-xs text-emerald-500 font-medium">Click to view</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 font-semibold">Not Uploaded</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDetailsModal