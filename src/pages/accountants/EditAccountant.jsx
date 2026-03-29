import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Upload, Save, User, Mail, Lock, Phone,
  MapPin, Award, Users, Briefcase, CheckCircle, X, AlertCircle,
  BookOpen, GraduationCap, UserCircle, Hash, FileText
} from 'lucide-react'
import { accountantService } from '../../services/accountendService/accountantService'

const EditAccountant = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    user_email: '',
    password: '',
    qualification: '',
    mobile_number: '',
    address: '',
    father_name: '',
    mother_name: '',
    experience_years: '',
    accountant_photo: null,
    aadhar_card: null,
  })

  const [filePreviews, setFilePreviews] = useState({
    accountant_photo: null,
    aadhar_card: null,
  })

  // Fetch accountant data
  useEffect(() => {
    if (!id) {
      setFetchError('No accountant ID provided')
      setFetching(false)
      return
    }

    const fetchAccountant = async () => {
      try {
        setFetching(true)
        setFetchError(null)

        console.log('Fetching accountant with ID:', id)
        const response = await accountantService.getAccountById(id)
        console.log('✅ Edit — loaded:', response)
        
        // ✅ FIXED: Handle response.data structure properly
        const accountant = response.data || response

        setFormData({
          name: accountant.name || '',
          user_email: accountant.user_email || '',
          password: '', // Don't populate password
          qualification: accountant.qualification || '',
          mobile_number: accountant.mobile_number || '',
          address: accountant.address || '',
          father_name: accountant.father_name || '',
          mother_name: accountant.mother_name || '',
          experience_years: accountant.experience_years != null
            ? String(accountant.experience_years)
            : '',
          accountant_photo: null,
          aadhar_card: null,
        })

        setFilePreviews({
          accountant_photo: accountant.accountant_photo_url || null,
          aadhar_card: accountant.aadhar_card_url || null,
        })
      } catch (err) {
        console.error('❌ Fetch error:', err)
        setFetchError(err.message || 'Failed to load accountant data')
      } finally {
        setFetching(false)
      }
    }

    fetchAccountant()
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (!files || !files[0]) return
    
    const file = files[0]
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('File size should not exceed 5MB')
      return
    }
    
    setFormData({ ...formData, [name]: file })
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setFilePreviews(prev => ({ ...prev, [name]: reader.result }))
      reader.readAsDataURL(file)
    } else {
      setFilePreviews(prev => ({ ...prev, [name]: file.name }))
    }
  }

  const removeFile = (field) => {
    setFormData({ ...formData, [field]: null })
    setFilePreviews(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!id) {
      setSaveError('Accountant ID missing')
      return
    }
    
    setLoading(true)
    setSaveError(null)
    
    try {
      // Create a clean object with only the fields we want to send
      const updateData = {
        name: formData.name,
        user_email: formData.user_email,
        qualification: formData.qualification,
        mobile_number: formData.mobile_number,
        address: formData.address,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        experience_years: formData.experience_years,
        accountant_photo: formData.accountant_photo,
        aadhar_card: formData.aadhar_card,
      }
      
      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password
      }
      
      console.log('Submitting update for ID:', id)
      console.log('Update data:', updateData)
      
      const result = await accountantService.updateAccountant(id, updateData)
      console.log('Update result:', result)
      
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        navigate('/admin/accountants')
      }, 1500)
    } catch (err) {
      console.error('Update error:', err)
      setSaveError(err.message || 'Failed to update accountant')
    } finally {
      setLoading(false)
    }
  }

  // Loading State
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-700 font-medium">Loading accountant data...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-2">Failed to load accountant data:</p>
          <p className="text-red-600 text-sm font-semibold mb-6 bg-red-50 rounded-lg p-3">{fetchError}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium">
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/accountants')}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-2">
          <div className="bg-white border-2 border-green-200 shadow-xl rounded-xl overflow-hidden">
            <div className="bg-green-500 px-4 py-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Success!</span>
            </div>
            <div className="p-4">
              <p className="text-gray-800">Accountant updated successfully!</p>
              <p className="text-sm text-gray-500 mt-1">Redirecting to list...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {saveError && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-2">
          <div className="bg-white border-2 border-red-200 shadow-xl rounded-xl overflow-hidden">
            <div className="bg-red-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Error</span>
              </div>
              <button onClick={() => setSaveError(null)} className="text-white hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-800">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/accountants')}>
              Accountants
            </span>
            <span>/</span>
            <span className="text-gray-800 font-medium">Edit Accountant</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/accountants')}
              className="p-2 bg-white hover:bg-gray-100 rounded-xl transition border border-gray-200 shadow-sm group">
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Accountant</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  required
                  placeholder="accountant@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  required
                  placeholder="e.g., CA, B.Com, MCA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 5"
                  min="0"
                  max="50"
                />
              </div>

            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-800">Address Information</h2>
              </div>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Family Information</h2>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Father's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Mother's full name"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Upload new files to replace existing ones (Max 5MB)</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Accountant Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accountant Photo</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                  {filePreviews.accountant_photo ? (
                    <div className="relative">
                      <img
                        src={filePreviews.accountant_photo}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('accountant_photo')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload new photo</span>
                      <span className="text-sm text-gray-400 mt-1">JPG, PNG</span>
                      <input
                        type="file"
                        name="accountant_photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Aadhar Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                  {filePreviews.aadhar_card ? (
                    <div className="relative">
                      {filePreviews.aadhar_card.startsWith('data:') || filePreviews.aadhar_card.startsWith('http') ? (
                        <img
                          src={filePreviews.aadhar_card}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center py-6">
                          <FileText className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-sm text-gray-700">{filePreviews.aadhar_card}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile('aadhar_card')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload new file</span>
                      <span className="text-sm text-gray-400 mt-1">JPG, PNG, PDF</span>
                      <input
                        type="file"
                        name="aadhar_card"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/accountants')}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Accountant
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditAccountant