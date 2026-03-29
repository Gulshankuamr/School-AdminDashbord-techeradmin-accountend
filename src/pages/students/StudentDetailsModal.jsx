import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit, Trash2, X, Download, User, DollarSign,
  FileText, Users, Copy, CheckCircle, Phone, MapPin,
  Shield, Briefcase, Building2, Heart, IdCard,
  Calendar, GraduationCap, BookOpen, Layers
} from 'lucide-react'
import { studentService } from '../../services/studentService/studentService'
import ImageModal from '../../components/ImageModal'

// ─── Fee heads parser (supports both name arrays AND id arrays) ────────────
function parseFeeHeadIds(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map(item => typeof item === 'object' ? Number(item.fee_head_id || item.id || 0) : Number(item))
      .filter(n => n > 0)
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (t.startsWith('[')) {
      try {
        const p = JSON.parse(t)
        return Array.isArray(p)
          ? p.map(item => typeof item === 'object' ? Number(item.fee_head_id || item.id) : Number(item)).filter(n => n > 0)
          : []
      } catch {}
    }
    const parts = t.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
    if (parts.length) return parts
  }
  const n = Number(raw)
  return n > 0 ? [n] : []
}

// ─── Title-case helper ─────────────────────────────────────────────────────
function toTitleCase(str) {
  if (!str) return str
  return String(str).toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Main component ────────────────────────────────────────────────────────
function StudentDetailsModal({ student: listStudent, onClose, onDelete }) {
  const navigate = useNavigate()

  const [student, setStudent]               = useState(listStudent)
  const [extraLoading, setExtraLoading]     = useState(true)
  const [allFeeHeads, setAllFeeHeads]       = useState([])
  const [copied, setCopied]                 = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage]   = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  useEffect(() => {
    if (!listStudent?.student_id) { setExtraLoading(false); return }
    const run = async () => {
      try {
        const [detail, feeData] = await Promise.all([
          studentService.getStudentById(listStudent.student_id).catch(() => null),
          studentService.getAllFeeHeads().catch(() => []),
        ])
        if (detail) setStudent(prev => ({ ...prev, ...detail }))
        setAllFeeHeads(Array.isArray(feeData) ? feeData : [])
      } catch (e) {
        console.error('StudentDetailsModal fetch error:', e)
      } finally {
        setExtraLoading(false)
      }
    }
    run()
  }, [listStudent?.student_id])

  // ✅ FIXED: Use fee_heads (names array from API) with fallback to selected_fee_heads (ID-based)
  const feeHeadsList = (() => {
    // Priority 1: fee_heads — array of name strings (what the API actually returns)
    const directNames = student?.fee_heads
    if (Array.isArray(directNames) && directNames.length > 0) {
      return directNames.map((name, index) => ({
        id: index + 1,
        name: typeof name === 'object' ? (name.head_name || name.fee_head_name || name.name || `Fee #${index + 1}`) : String(name),
      }))
    }

    // Priority 2: selected_fee_heads — ID-based (legacy / future backend format)
    const ids = parseFeeHeadIds(student?.selected_fee_heads)
    if (ids.length > 0) {
      return ids.map(id => {
        const match = allFeeHeads.find(fh => Number(fh.fee_head_id) === id)
        return { id, name: match?.head_name || match?.fee_head_name || null }
      })
    }

    return []
  })()

  const handleEdit = () => {
    onClose?.()
    navigate(`/admin/students/edit/${student.student_id}`)
  }

  const handleCopyEmail = () => {
    if (!student?.user_email) return
    navigator.clipboard.writeText(student.user_email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openImage = (url, title) => {
    setSelectedImage(url)
    setSelectedImageTitle(title)
    setImageModalOpen(true)
  }

  const fmt = (val) => val ? String(val).split('T')[0] : null

  const classSection = [student?.class_name, student?.section_name].filter(Boolean).join(' — ')

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden w-full">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Student Details</h2>
              <p className="text-xs text-gray-500">Complete profile information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            {onDelete && (
              <button onClick={() => onDelete(student)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ── PROFILE BANNER ── */}
          <div className="flex items-start gap-5 pb-5 border-b border-gray-100">

            {/* Photo */}
            <div className="flex-shrink-0 text-center">
              {student?.student_photo_url ? (
                <img
                  src={student.student_photo_url}
                  alt={student.name}
                  onClick={() => openImage(student.student_photo_url, 'Student Photo')}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow cursor-pointer hover:opacity-90 transition"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow">
                  <span className="text-white text-2xl font-bold">
                    {student?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
            </div>

            {/* Core Info Grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">

              <InfoCell label="Full Name" value={student?.name} />

              <InfoCell label="Admission No">
                {student?.admission_no && student.admission_no !== 'null'
                  ? <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      <IdCard className="w-3 h-3" /> {student.admission_no}
                    </span>
                  : <span className="text-sm text-gray-400">—</span>
                }
              </InfoCell>

              <InfoCell label="Email">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                    {student?.user_email || '—'}
                  </span>
                  {student?.user_email && (
                    <button onClick={handleCopyEmail} className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition">
                      {copied
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        : <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  )}
                </div>
              </InfoCell>

              <InfoCell
                label="Gender"
                value={student?.gender
                  ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase()
                  : null
                }
              />

              <InfoCell label="Class & Section" value={classSection || null} />

              <InfoCell label="Roll Number">
                {student?.roll_no
                  ? <span className="text-sm font-bold text-gray-900">{student.roll_no}</span>
                  : <span className="text-sm text-gray-400 italic">Not assigned</span>
                }
              </InfoCell>

            </div>
          </div>

          {/* ── PERSONAL DETAILS ── */}
          <div>
            <SectionTitle icon={User} label="Personal Details" color="blue" />
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">

              {student?.dob && (
                <InfoCell label="Date of Birth">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> {fmt(student.dob)}
                  </span>
                </InfoCell>
              )}
              {student?.mobile_number && (
                <InfoCell label="Mobile Number">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {student.mobile_number}
                  </span>
                </InfoCell>
              )}
              {student?.academic_year && (
                <InfoCell label="Academic Year">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> {student.academic_year}
                  </span>
                </InfoCell>
              )}
              {student?.blood_group && (
                <InfoCell label="Blood Group">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    <Heart className="w-3 h-3" /> {student.blood_group}
                  </span>
                </InfoCell>
              )}
              {student?.category && (
                <InfoCell label="Category">
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {student.category}
                  </span>
                </InfoCell>
              )}
              {student?.religion && (
                <InfoCell label="Religion" value={student.religion} />
              )}
              {student?.class_name && (
                <InfoCell label="Class">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" /> {student.class_name}
                  </span>
                </InfoCell>
              )}
              {student?.section_name && (
                <InfoCell label="Section">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Layers className="w-3.5 h-3.5 text-gray-400" /> {student.section_name}
                  </span>
                </InfoCell>
              )}
              {student?.passed_out != null && (
                <InfoCell label="Passed Out">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    student.passed_out === 1 || student.passed_out === '1'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {student.passed_out === 1 || student.passed_out === '1' ? 'Yes' : 'No'}
                  </span>
                </InfoCell>
              )}
              {student?.transfer != null && (
                <InfoCell label="Transfer">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    student.transfer === 1 || student.transfer === '1'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {student.transfer === 1 || student.transfer === '1' ? 'Yes' : 'No'}
                  </span>
                </InfoCell>
              )}

            </div>
            {extraLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs mt-3">
                <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-gray-500" />
                Loading complete profile...
              </div>
            )}
          </div>

          {/* ── IDENTITY ── */}
          {student?.aadhar_number && (
            <div>
              <SectionTitle icon={Shield} label="Identity" color="indigo" />
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                <InfoCell label="Aadhaar Number">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 tracking-widest">
                    <IdCard className="w-3.5 h-3.5 text-gray-400" />
                    {String(student.aadhar_number).replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                  </span>
                </InfoCell>
              </div>
            </div>
          )}

          {/* ── ADDRESS ── */}
          {(student?.address || student?.city || student?.state || student?.pincode) && (
            <div>
              <SectionTitle icon={MapPin} label="Address" color="orange" />
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {student?.address && (
                  <div className="col-span-2 sm:col-span-3">
                    <InfoCell label="Full Address" value={student.address} />
                  </div>
                )}
                {student?.city && (
                  <InfoCell label="City">
                    {/* ✅ FIXED: ALL CAPS city converted to Title Case */}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" /> {toTitleCase(student.city)}
                    </span>
                  </InfoCell>
                )}
                {student?.state && (
                  <InfoCell label="State">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {student.state}
                    </span>
                  </InfoCell>
                )}
                {student?.pincode && (
                  <InfoCell label="Pincode">
                    <span className="text-sm font-semibold text-gray-900">{student.pincode}</span>
                  </InfoCell>
                )}
              </div>
            </div>
          )}

          {/* ── FAMILY & CONTACT ── */}
          {(student?.father_name || student?.mother_name || student?.guardian_name || student?.emergency_contact_number) && (
            <div>
              <SectionTitle icon={Users} label="Family & Contact" color="green" />
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {student?.father_name && <InfoCell label="Father's Name" value={student.father_name} />}
                {student?.father_mobile && (
                  <InfoCell label="Father's Mobile">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {student.father_mobile}
                    </span>
                  </InfoCell>
                )}
                {student?.father_occupation && (
                  <InfoCell label="Father's Occupation">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {student.father_occupation}
                    </span>
                  </InfoCell>
                )}
                {student?.mother_name && <InfoCell label="Mother's Name" value={student.mother_name} />}
                {student?.mother_mobile && (
                  <InfoCell label="Mother's Mobile">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {student.mother_mobile}
                    </span>
                  </InfoCell>
                )}
                {student?.mother_occupation && (
                  <InfoCell label="Mother's Occupation">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {student.mother_occupation}
                    </span>
                  </InfoCell>
                )}
                {student?.guardian_name && <InfoCell label="Guardian Name" value={student.guardian_name} />}
                {student?.emergency_contact_number && (
                  <InfoCell label="Emergency Contact">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600">
                      <Phone className="w-3.5 h-3.5" /> {student.emergency_contact_number}
                    </span>
                  </InfoCell>
                )}
              </div>
            </div>
          )}

          {/* ── FEE HEADS ── ✅ FIXED: now reads student.fee_heads correctly */}
          {feeHeadsList.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-2">
                Fee Structure — {feeHeadsList.length} head{feeHeadsList.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {feeHeadsList.map(fee => (
                  <span key={fee.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                    <DollarSign className="w-3 h-3 text-yellow-500" />
                    {fee.name || `Fee Head #${fee.id}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS & PHOTOS ── */}
          <div>
            <SectionTitle icon={FileText} label="Documents & Photos" color="purple" />
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DocCard label="Student Photo"  url={student?.student_photo_url} onView={openImage} title="Student Photo" />
              <DocCard label="Father's Photo" url={student?.father_photo_url}  onView={openImage} title="Father's Photo" />
              <DocCard label="Mother's Photo" url={student?.mother_photo_url}  onView={openImage} title="Mother's Photo" />
              <DocCard label="Aadhaar Card"   url={student?.aadhar_card_url}   onView={openImage} title="Aadhaar Card" isAadhar />
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() =>
              [student?.father_photo_url, student?.mother_photo_url, student?.aadhar_card_url, student?.student_photo_url]
                .filter(Boolean)
                .forEach(url => window.open(url, '_blank'))
            }
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
          >
            <Download className="w-4 h-4" /> Download All Docs
          </button>
          <button onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold transition">
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

// ─── Helper sub-components ─────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label, color = 'blue' }) {
  const map = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
      <div className={`p-1 rounded-md ${map[color]}`}><Icon className="w-3.5 h-3.5" /></div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function InfoCell({ label, value, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      {children ?? <p className="text-sm font-bold text-gray-900">{value || '—'}</p>}
    </div>
  )
}

function DocCard({ label, url, onView, title, isAadhar }) {
  const isImg = url && /\.(jpg|jpeg|png|gif|webp)/i.test(url)
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
      <div
        onClick={() => url && onView(url, title)}
        className={`h-28 rounded-xl border overflow-hidden flex items-center justify-center transition ${
          url
            ? 'cursor-pointer border-gray-200 hover:border-blue-300 hover:shadow-md'
            : 'border-dashed border-gray-200 bg-gray-50/80'
        }`}
      >
        {url ? (
          isImg ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gray-50">
              {isAadhar ? (
                <>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold">Aadhaar Card</p>
                  <p className="text-xs text-blue-500">Click to view</p>
                </>
              ) : (
                <>
                  <FileText className="w-8 h-8 text-gray-300" />
                  <p className="text-xs text-gray-400">View File</p>
                </>
              )}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 font-medium">Not Uploaded</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDetailsModal