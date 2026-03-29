import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2, Eye, Edit, Plus, ChevronLeft, ChevronRight,
  Users, Award, Phone, Mail, Briefcase, Search, Filter,
  MapPin, GraduationCap, UserCircle
} from 'lucide-react'
import { accountantService } from '../../services/accountendService/accountantService'
import AccountantDetailsModal from './AccountantDetailsModal'

function AccountantList() {
  const navigate = useNavigate()

  const [accountants, setAccountants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAccountants, setTotalAccountants] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccountant, setSelectedAccountant] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [accountantToDelete, setAccountantToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAccountants = useCallback(async (pageNumber) => {
    try {
      setLoading(true)
      setError(null)
      const res = await accountantService.getAllAccountants(pageNumber)
      const list = Array.isArray(res.data) ? res.data : []
      const pag = res.pagination || {}
      setAccountants(list)
      setPage(pag.page || pageNumber)
      setTotalPages(pag.totalPages || 1)
      setTotalAccountants(pag.total ?? list.length)
    } catch (err) {
      console.error('Error fetching accountants:', err)
      setError(err.message || 'Failed to load accountants')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAccountants(page) }, [page, fetchAccountants])

  const handleViewAccountant = (accountant) => {
    setSelectedAccountant(accountant)
    setIsModalOpen(true)
  }
  
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedAccountant(null)
  }
  
  const handleDeleteFromModal = (accountant) => {
    closeModal()
    setAccountantToDelete(accountant)
    setShowDeleteConfirm(true)
  }
  
  const handleDeleteClick = (accountant) => {
    setAccountantToDelete(accountant)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!accountantToDelete) return
    try {
      setDeleting(true)
      await accountantService.deleteAccountant(accountantToDelete.accountant_id)
      setShowDeleteConfirm(false)
      setAccountantToDelete(null)
      fetchAccountants(accountants.length === 1 && page > 1 ? page - 1 : page)
    } catch (err) {
      console.error('Delete error:', err)
      alert(err.message || 'Failed to delete accountant')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setAccountantToDelete(null)
  }

  const filteredAccountants = accountants.filter(acc => 
    acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.mobile_number?.includes(searchTerm) ||
    acc.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading State
  if (loading && accountants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading accountants...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error && accountants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => fetchAccountants(page)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium shadow-lg shadow-purple-200">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="w-full">

          {/* Header with Search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Accountants</h1>
                <p className="text-gray-600 mt-1">Manage all accountant records</p>
              </div>
              <button onClick={() => navigate('/admin/accountants/add')}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition flex items-center gap-2 font-medium shadow-lg shadow-purple-200">
                <Plus className="w-5 h-5" /> Add New Accountant
              </button>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{totalAccountants}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Qualified</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountants.filter(a => a.qualification).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experienced</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountants.filter(a => a.experience_years > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">With Mobile</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountants.filter(a => a.mobile_number).length}
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Search Bar */}
            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, mobile, or qualification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            {loading && accountants.length > 0 && (
              <div className="px-6 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                <span className="text-sm text-purple-700 font-medium">Refreshing...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAccountants.length === 0 && (
              <div className="py-20 text-center">
                <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {searchTerm ? 'No matching accountants' : 'No accountants found'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Try a different search term' : 'Start by adding your first accountant'}
                </p>
                {!searchTerm && (
                  <button onClick={() => navigate('/admin/accountants/add')}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add First Accountant
                  </button>
                )}
              </div>
            )}

            {/* Table - NO ID COLUMN */}
            {filteredAccountants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Accountant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qualification</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th> */}
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAccountants.map((accountant) => (
                      <tr key={accountant.accountant_id} className="hover:bg-gray-50 transition-colors">
                        {/* Name + Avatar - NO ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {accountant.accountant_photo_url ? (
                              <img src={accountant.accountant_photo_url} alt={accountant.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {accountant.name?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{accountant.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{accountant.user_email || 'No email'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact - Email */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-800">{accountant.user_email || '—'}</span>
                          </div>
                        </td>

                        {/* Qualification */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                            {accountant.qualification || 'Not specified'}
                          </span>
                        </td>

                        {/* Experience - SHOWN HERE */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {accountant.experience_years ? (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-800">
                                {accountant.experience_years} yr{Number(accountant.experience_years) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>

                        {/* Mobile - SHOWN HERE */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {accountant.mobile_number ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-800">{accountant.mobile_number}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>

                        {/* Status */}
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            accountant.status === 1
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${accountant.status === 1 ? 'bg-green-500' : 'bg-red-400'}`}></span>
                            {accountant.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td> */}

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleViewAccountant(accountant)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition group"
                              title="View Details">
                              <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
                            </button>
                            <button onClick={() => navigate(`/admin/accountants/edit/${accountant.accountant_id}`)}
                              className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition group"
                              title="Edit">
                              <Edit className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
                            </button>
                            <button onClick={() => handleDeleteClick(accountant)}
                              className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition group"
                              title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredAccountants.length > 0 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-800">{filteredAccountants.length}</span> of{' '}
                  <span className="font-semibold text-gray-800">{totalAccountants}</span> accountants
                </p>
                {totalPages > 1 && (
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <button
                      disabled={page === 1 || loading}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm font-medium">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      disabled={page === totalPages || loading}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm font-medium">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedAccountant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <AccountantDetailsModal
              accountant={selectedAccountant}
              onClose={closeModal}
              onDelete={handleDeleteFromModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Accountant?</h3>
            <p className="text-gray-600 text-center mb-1">Are you sure you want to delete</p>
            <p className="text-center font-bold text-gray-900 text-lg mb-1">{accountantToDelete?.name}</p>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={cancelDelete} disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <><Trash2 className="w-5 h-5" /> Delete Accountant</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AccountantList