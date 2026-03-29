import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, CheckCircle, AlertCircle, X,
  User, Mail, Lock, Phone, MapPin, Award, Users, Briefcase, FileText
} from 'lucide-react'
import { accountantService } from '../../services/accountendService/accountantService'

const AddAccountant = () => {
  const navigate = useNavigate()

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

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB')
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
  }

  const resetForm = () => {
    setFormData({
      name: '', user_email: '', password: '', qualification: '',
      mobile_number: '', address: '', father_name: '', mother_name: '',
      experience_years: '', accountant_photo: null, aadhar_card: null,
    })
    setFilePreviews({ accountant_photo: null, aadhar_card: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Create a clean object with all fields
      const submitData = {
        name: formData.name,
        user_email: formData.user_email,
        password: formData.password,
        qualification: formData.qualification,
        mobile_number: formData.mobile_number,
        address: formData.address,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        experience_years: formData.experience_years,
        accountant_photo: formData.accountant_photo,
        aadhar_card: formData.aadhar_card,
      }
      
      await accountantService.addAccountant(submitData)
      setSuccessInfo({ name: formData.name })
      resetForm()
      setTimeout(() => {
        setSuccessInfo(null)
        navigate('/admin/accountants')
      }, 2000)
    } catch (err) {
      console.error('Error adding accountant:', err)
      setError(err.message || 'Failed to add accountant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">

      {/* Error Toast */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-2">
          <div className="bg-white border-2 border-red-200 shadow-xl rounded-xl overflow-hidden">
            <div className="bg-red-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Error</span>
              </div>
              <button onClick={() => setError(null)} className="text-white hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successInfo && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-2">
          <div className="bg-white border-2 border-green-200 shadow-xl rounded-xl overflow-hidden">
            <div className="bg-green-500 px-4 py-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Accountant Added!</span>
            </div>
            <div className="p-4">
              <p className="text-gray-800">
                <span className="font-bold">{successInfo.name}</span> has been registered successfully.
              </p>
              {/* <p className="text-sm text-gray-500 mt-1">Redirecting to list...</p> */}
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
            <span className="text-gray-800 font-medium">Add New</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/accountants')}
              className="p-2 bg-white hover:bg-gray-100 rounded-xl transition border border-gray-200 shadow-sm group">
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Accountant</h1>
              <p className="text-gray-600 mt-1">Fill in the details to register a new accountant</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
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
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
                    required
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
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
                  placeholder="e.g., 2"
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
              <p className="text-sm text-gray-500 mt-1">JPG, PNG or PDF accepted (Max 5MB)</p>
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
                        onClick={() => {
                          setFormData({ ...formData, accountant_photo: null })
                          setFilePreviews(prev => ({ ...prev, accountant_photo: null }))
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload photo</span>
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
                      {filePreviews.aadhar_card.startsWith('data:') ? (
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
                        onClick={() => {
                          setFormData({ ...formData, aadhar_card: null })
                          setFilePreviews(prev => ({ ...prev, aadhar_card: null }))
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload file</span>
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
              onClick={resetForm}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium disabled:opacity-50"
            >
              Reset
            </button>
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
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition shadow-lg shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Add Accountant
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AddAccountant