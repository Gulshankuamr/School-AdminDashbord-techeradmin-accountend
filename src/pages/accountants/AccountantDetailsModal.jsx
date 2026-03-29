import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit, Trash2, X, Download, User, FileText,
  Copy, CheckCircle, Phone, MapPin, Award,
  Mail, Users, Briefcase, IdCard, Calendar, BookOpen,
  Home, UserCircle, AtSign, Hash, GraduationCap
} from 'lucide-react'
import { accountantService } from '../../services/accountendService/accountantService'
import ImageModal from '../../components/ImageModal'

function AccountantDetailsModal({ accountant: listAccountant, onClose, onDelete }) {
  const navigate = useNavigate()

  const [accountant, setAccountant] = useState(listAccountant)
  const [extraLoading, setExtraLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImageTitle, setSelectedImageTitle] = useState('')

  // Fetch full details if needed
  useEffect(() => {
    if (!listAccountant?.accountant_id) return
    
    // Check if we already have all fields
    const hasAllFields = listAccountant.address || 
                         listAccountant.father_name || 
                         listAccountant.mother_name ||
                         listAccountant.aadhar_card_url
    
    if (!hasAllFields) {
      const fetchExtra = async () => {
        try {
          setExtraLoading(true)
          const detail = await accountantService.getAccountById(listAccountant.accountant_id)
          if (detail) {
            setAccountant(prev => ({ ...prev, ...detail }))
          }
        } catch (err) {
          console.error('Detail fetch failed — using list data:', err)
        } finally {
          setExtraLoading(false)
        }
      }
      
      fetchExtra()
    }
  }, [listAccountant])

  const handleEdit = () => {
    onClose()
    navigate(`/admin/accountants/edit/${accountant.accountant_id}`)
  }

  const handleCopyEmail = () => {
    if (accountant?.user_email) {
      navigator.clipboard.writeText(accountant.user_email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openImage = (url, title) => {
    setSelectedImage(url)
    setSelectedImageTitle(title)
    setImageModalOpen(true)
  }

  const a = accountant

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden w-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Accountant Details</h2>
              <p className="text-sm text-gray-600">Complete profile information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-purple-200">
              <Edit className="w-4 h-4" /> Edit
            </button>
            {onDelete && (
              <button onClick={() => onDelete(a)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Profile Banner - REMOVED ID AND NAME FROM HERE */}
          <div className="flex flex-col md:flex-row items-start gap-6 pb-6 border-b border-gray-100">
            {/* Avatar */}
            <div className="flex-shrink-0 text-center md:text-left">
              {a?.accountant_photo_url ? (
                <img src={a.accountant_photo_url} alt={a.name}
                  onClick={() => openImage(a.accountant_photo_url, 'Accountant Photo')}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition mx-auto md:mx-0" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg mx-auto md:mx-0">
                  <span className="text-white text-3xl font-bold">
                    {a?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              {/* Status badge */}
              {/* <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                  a?.status === 1
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${a?.status === 1 ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  {a?.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div> */}
            </div>

            {/* Quick Info Grid - REMOVED ID CARD, ONLY NAME AND CONTACT */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <InfoCard 
                label="Full Name" 
                value={a?.name || '—'} 
                icon={UserCircle} 
              />
              <InfoCard 
                label="Email" 
                value={a?.user_email || '—'} 
                icon={AtSign} 
                isEmail 
              />
              <InfoCard 
                label="Mobile" 
                value={a?.mobile_number || '—'} 
                icon={Phone} 
              />
              <InfoCard 
                label="Qualification" 
                value={a?.qualification || '—'} 
                icon={GraduationCap} 
              />
            </div>
          </div>

          {/* Loading indicator */}
          {extraLoading && (
            <div className="flex items-center gap-2 text-purple-600 text-sm bg-purple-50 p-3 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
              <span className="text-purple-700">Loading additional details...</span>
            </div>
          )}

          {/* Professional Info */}
          <Section title="Professional Information" icon={Award} color="purple">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoBox 
                label="Qualification" 
                value={a?.qualification} 
                icon={GraduationCap} 
              />
              <InfoBox 
                label="Experience" 
                value={a?.experience_years ? `${a.experience_years} ${Number(a.experience_years) === 1 ? 'year' : 'years'}` : null} 
                icon={Briefcase} 
              />
              <InfoBox 
                label="Email" 
                value={a?.user_email} 
                icon={Mail} 
              />
            </div>
          </Section>

          {/* Address */}
          <Section title="Address Information" icon={MapPin} color="orange">
            <div className="bg-orange-50/30 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-800">{a?.address || 'No address provided'}</p>
              </div>
            </div>
          </Section>

          {/* Family Info */}
          <Section title="Family Information" icon={Users} color="green">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBox 
                label="Father's Name" 
                value={a?.father_name} 
                icon={User} 
              />
              <InfoBox 
                label="Mother's Name" 
                value={a?.mother_name} 
                icon={User} 
              />
            </div>
          </Section>

          {/* Additional Details */}
          <Section title="Additional Details" icon={FileText} color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBox 
                label="Qualification Details" 
                value={a?.qualification || 'Not specified'} 
                icon={BookOpen} 
              />
              <InfoBox 
                label="Experience Years" 
                value={a?.experience_years ? `${a.experience_years} years` : 'Not specified'} 
                icon={Briefcase} 
              />
              {a?.created_at && (
                <InfoBox 
                  label="Registered On" 
                  value={new Date(a.created_at).toLocaleDateString()} 
                  icon={Calendar} 
                />
              )}
            </div>
          </Section>

          {/* Documents */}
          <Section title="Documents" icon={FileText} color="indigo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentCard 
                label="Accountant Photo" 
                url={a?.accountant_photo_url} 
                onView={openImage} 
                title="Accountant Photo" 
              />
              <DocumentCard 
                label="Aadhaar Card" 
                url={a?.aadhar_card_url} 
                onView={openImage} 
                title="Aadhaar Card" 
              />
            </div>
          </Section>

          {/* System Info */}
          {(a?.created_at || a?.updated_at) && (
            <Section title="System Information" icon={Calendar} color="gray">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {a?.created_at && (
                  <InfoBox 
                    label="Created On" 
                    value={new Date(a.created_at).toLocaleString()} 
                    icon={Calendar} 
                  />
                )}
                {a?.updated_at && (
                  <InfoBox 
                    label="Last Updated" 
                    value={new Date(a.updated_at).toLocaleString()} 
                    icon={Calendar} 
                  />
                )}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              const urls = []
              if (a?.accountant_photo_url) urls.push(a.accountant_photo_url)
              if (a?.aadhar_card_url) urls.push(a.aadhar_card_url)
              urls.forEach(url => window.open(url, '_blank'))
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition">
            <Download className="w-4 h-4" /> Download All Documents
          </button>
          <button onClick={onClose}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition">
            Close
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

// Helper Components
function Section({ title, icon: Icon, color, children }) {
  const colors = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    gray: 'bg-gray-100 text-gray-600',
  }
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoCard({ label, value, icon: Icon, isEmail, highlight }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className={`p-3 rounded-xl ${highlight ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className={`text-base font-semibold truncate ${highlight ? 'text-purple-800' : 'text-gray-900'}`}>
          {value}
        </span>
        {isEmail && value !== '—' && (
          <button onClick={handleCopy} className="ml-auto flex-shrink-0">
            {copied ? 
              <CheckCircle className="w-4 h-4 text-green-500" /> : 
              <Copy className="w-4 h-4 text-gray-400 hover:text-purple-500" />
            }
          </button>
        )}
      </div>
    </div>
  )
}

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-base font-medium text-gray-900">{value || '—'}</span>
      </div>
    </div>
  )
}

function DocumentCard({ label, url, onView, title }) {
  const isImg = url && /\.(jpg|jpeg|png|gif|webp)/i.test(url)
  
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div
        onClick={() => url && onView(url, title)}
        className={`h-36 rounded-xl border-2 overflow-hidden flex items-center justify-center transition ${
          url
            ? 'cursor-pointer border-gray-200 hover:border-purple-300 hover:shadow-md'
            : 'border-dashed border-gray-200 bg-gray-50'
        }`}
      >
        {url ? (
          isImg ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Click to view</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Not Uploaded</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountantDetailsModal