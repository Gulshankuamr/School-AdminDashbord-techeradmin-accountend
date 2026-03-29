import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Eye, Edit, Plus, ChevronLeft, ChevronRight, Users, Search, RefreshCw } from 'lucide-react'
import { teacherService } from '../../services/teacherService/teacherService'
import TeacherDetailsModal from './TeacherDetailsModal'

function TeacherList() {
  const navigate = useNavigate()

  const [teachers, setTeachers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTeachers = async (pageNumber) => {
    try {
      setLoading(true)
      setError(null)
      const res = await teacherService.getAllTeachers(pageNumber)
      const list = Array.isArray(res.data) ? res.data : []
      const pagination = res.pagination || {}
      setTeachers(list)
      setPage(pagination.page || pageNumber)
      setTotalPages(pagination.totalPages || 1)
      setTotalTeachers(pagination.total || list.length)
    } catch (err) {
      setError(err.message || 'Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeachers(page) }, [page])

  const handleViewTeacher = (teacher) => { setSelectedTeacher(teacher); setIsModalOpen(true) }
  const closeModal = () => { setIsModalOpen(false); setSelectedTeacher(null) }
  const handleDeleteFromModal = (teacher) => { closeModal(); setTeacherToDelete(teacher); setShowDeleteConfirm(true) }
  const handleDeleteClick = (teacher) => { setTeacherToDelete(teacher); setShowDeleteConfirm(true) }

  const confirmDelete = async () => {
    if (!teacherToDelete) return
    try {
      setDeleting(true)
      await teacherService.deleteTeacher(teacherToDelete.teacher_id)
      setShowDeleteConfirm(false)
      setTeacherToDelete(null)
      const newPage = teachers.length === 1 && page > 1 ? page - 1 : page
      fetchTeachers(newPage)
    } catch (err) {
      alert(err.message || 'Failed to delete teacher')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => { setShowDeleteConfirm(false); setTeacherToDelete(null) }

  if (loading && teachers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-5">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-gray-700 font-bold">Loading teachers...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="mx-auto h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button onClick={() => fetchTeachers(page)}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-bold text-sm flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!loading && teachers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Teachers</h1>
              <p className="text-gray-400 text-sm mt-0.5">Manage all registered teachers</p>
            </div>
            <button onClick={() => navigate('/admin/teachers/add')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition flex items-center gap-2 font-bold text-sm shadow-md">
              <Plus className="w-4 h-4" /> Add Teacher
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
            <div className="mx-auto h-20 w-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100">
              <Users className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No Teachers Found</h2>
            <p className="text-gray-400 text-sm mb-6">Start by adding your first teacher to the system</p>
            <button onClick={() => navigate('/admin/teachers/add')}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-bold text-sm inline-flex items-center gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Add First Teacher
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 p-3 sm:p-4 lg:p-6">
        <div className="w-full">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <span className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-semibold">Teachers</span>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Teachers</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                  <Users className="w-3 h-3" /> {totalTeachers} Registered
                </span>
                {loading && (
                  <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold border border-gray-100">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Refreshing...
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => navigate('/admin/teachers/add')}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition flex items-center gap-2 font-bold text-sm shadow-md hover:shadow-lg">
              <Plus className="w-4 h-4" /> Add New Teacher
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Qualification</th>
                    <th className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Experience</th>
                    {/* <th className="px-5 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th> */}
                    <th className="px-5 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teachers.map((teacher) => (
                    <tr key={teacher.teacher_id} className="hover:bg-emerald-50/30 transition-colors duration-150 group">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {teacher.teacher_photo_url ? (
                            <img src={teacher.teacher_photo_url} alt={teacher.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 flex-shrink-0 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white font-black text-sm">
                                {teacher.name?.charAt(0)?.toUpperCase() || 'T'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-900">{teacher.name || 'N/A'}</p>
                            {teacher.employee_id && (
                              <p className="text-xs text-gray-400 font-medium">EMP ID-{teacher.employee_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-sm text-gray-600 font-medium">{teacher.user_email || 'N/A'}</p>
                        {teacher.mobile_number && (
                          <p className="text-xs text-gray-400 mt-0.5">{teacher.mobile_number}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {teacher.qualification || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {teacher.designation ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            {teacher.designation}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                        {teacher.employment_type && (
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{teacher.employment_type.replace(/_/g, ' ')}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-700">
                          {teacher.experience_years != null ? `${teacher.experience_years} yr${teacher.experience_years !== 1 ? 's' : ''}` : '—'}
                        </span>
                      </td>
                      {/* <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          teacher.status === 1
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 1 ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                          {teacher.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td> */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleViewTeacher(teacher)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition group/btn" title="View Details">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button onClick={() => navigate(`/admin/teachers/edit/${teacher.teacher_id}`)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition" title="Edit">
                            <Edit className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button onClick={() => handleDeleteClick(teacher)}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 gap-3 bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium">
                Page <span className="font-bold text-gray-700">{page}</span> of{' '}
                <span className="font-bold text-gray-700">{totalPages}</span>
                <span className="text-gray-400 ml-2">· {totalTeachers} total teachers</span>
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1 || loading} onClick={() => setPage(page - 1)}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs flex items-center gap-1.5 font-bold shadow-sm hover:border-gray-300">
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs flex items-center gap-1.5 font-bold shadow-sm hover:border-gray-300">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">
            <TeacherDetailsModal
              teacher={selectedTeacher}
              onClose={closeModal}
              onDelete={handleDeleteFromModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 rounded-2xl mb-5">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center mb-1">Delete Teacher?</h3>
            <p className="text-gray-500 text-sm text-center mb-1">You are about to permanently delete</p>
            <p className="text-center font-black text-gray-900 text-base mb-1">{teacherToDelete?.name}</p>
            <p className="text-xs text-red-400 text-center mb-6 font-medium">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={cancelDelete} disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold text-sm disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TeacherList