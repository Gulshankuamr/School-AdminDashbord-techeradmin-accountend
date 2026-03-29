// src/pages/profile/Profile.jsx
import { useEffect, useState } from 'react'
import { dashboardService } from '../../services/dashboardService'
import { useAuth } from '../../context/AuthContext'
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Target,
  Calendar,
  Users,
  School,
  User,
  ChevronRight,
  Award
} from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        // Fetch both profile and stats
        const [profileData, statsData] = await Promise.all([
          dashboardService.getAdminProfile(),
          dashboardService.getDashboardStats()
        ])
        setProfile(profileData)
        setStats(statsData)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#13daec] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#13daec] text-white rounded-lg hover:bg-[#11c5d6] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-r from-[#13daec] to-[#0fa9b8] overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 text-white/90 text-sm mb-4">
            <span>General Settings</span>
            <ChevronRight className="w-4 h-4" />
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Institute Profile
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <School className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile?.school_name || 'Institute Profile'}
              </h1>
              <p className="text-white/90 text-lg">
                Complete institute information and statistics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            {/* Institute Logo Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 transform transition-all hover:shadow-2xl">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#13daec]/10 to-[#0fa9b8]/10 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-[#13daec]/20">
                    <div className="text-center">
                      <School className="w-12 h-12 text-[#13daec] mx-auto mb-1" />
                      <span className="text-xs text-gray-500 font-medium">Institute</span>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {profile?.school_name || 'Institute Name'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {profile?.role?.replace('_', ' ').toUpperCase() || 'School Admin'}
                </p>

              </div>
            </div>

            {/* Contact Information Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#13daec]/5 to-[#0fa9b8]/5 rounded-2xl p-5 border border-[#13daec]/20 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Phone className="w-6 h-6 text-[#13daec]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone Number</p>
                    <p className="font-semibold text-gray-900 text-lg">{profile?.school_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email Address</p>
                    <p className="font-semibold text-gray-900 break-all">{profile?.user_email || profile?.school_email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Account Information</h3>
                  <p className="text-xs text-gray-500">Your profile details</p>
                </div>
              </div>
              <p className="font-medium text-gray-900 text-lg">{user?.name || profile?.name || 'User Name'}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role?.replace('_', ' ') || 'User Role'}</p>
            </div>
          </div>

          {/* Right Column - Statistics and Details */}
          <div className="lg:col-span-2">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 text-center transform transition-all hover:scale-105">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.students || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Total Students</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 text-center transform transition-all hover:scale-105">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.teachers || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Total Teachers</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 text-center transform transition-all hover:scale-105">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.classes || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Total Classes</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 text-center transform transition-all hover:scale-105">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.accountants || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Accountants</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 text-center transform transition-all hover:scale-105">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <School className="w-6 h-6 text-cyan-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.sections || 0}</p>
                <p className="text-xs text-gray-600 font-medium">Total Sections</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 text-center transform transition-all hover:scale-105">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{new Date().getFullYear()}</p>
                <p className="text-xs text-gray-600 font-medium">Established</p>
              </div>
            </div>

            {/* Institute Details Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#13daec]/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#13daec]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Institute Information</h3>
                  <p className="text-sm text-gray-500">Complete details and location</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Institute Name</p>
                  <p className="font-semibold text-gray-900 text-lg">{profile?.school_name || 'Not specified'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
                  <p className="font-semibold text-gray-900 text-lg capitalize">{profile?.role?.replace('_', ' ') || 'School Admin'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Website</p>
                  {profile?.website ? (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-[#13daec] hover:text-[#11c5d6] text-lg inline-flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-900 text-lg">Not provided</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-gray-900 break-all">{profile?.school_email || profile?.user_email || 'Not provided'}</p>
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Address</p>
                    <p className="font-medium text-gray-900 text-lg leading-relaxed">
                      {profile?.school_address || 'No address provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Institute Mission</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {profile?.target_line || 'Committed to excellence in education and student development'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile