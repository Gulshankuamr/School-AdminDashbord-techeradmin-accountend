// src/pages/FeeList.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, Filter, Plus, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feecreateService } from '../../services/feeallService/feecreateService';

const FeeList = () => {
  const navigate = useNavigate();

  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [authError, setAuthError] = useState('');

  // ✅ Academic Years from API
  const [academicYears, setAcademicYears] = useState([]);
  const [yearsLoading,  setYearsLoading]  = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    academicYear: '',
    classId:      '',
    feeHeadId:    '',
    search:       ''
  });

  // Summary data
  const [summary, setSummary] = useState({
    totalStructures:   0,
    activeFees:        0,
    estimatedRevenue:  0
  });

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feeToDelete,     setFeeToDelete]     = useState(null);

  // ✅ Load Academic Years from API on mount
  useEffect(() => {
    feecreateService.getAcademicYears()
      .then(years => setAcademicYears(years))
      .catch(e => console.warn('Failed to load academic years:', e.message))
      .finally(() => setYearsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [fees, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setAuthError('');

      const feeResponse = await feecreateService.getAllFees();
      console.log('📊 Fee API Response:', feeResponse);

      let feesData = [];
      if (feeResponse.data?.fees && Array.isArray(feeResponse.data.fees)) {
        feesData = feeResponse.data.fees;
      } else if (Array.isArray(feeResponse.data)) {
        feesData = feeResponse.data;
      } else if (feeResponse.data?.data?.fees) {
        feesData = feeResponse.data.data.fees;
      }

      setFees(feesData);

      try {
        const classResponse = await feecreateService.getAllClasses();
        setClasses(classResponse.data || []);
      } catch (classError) {
        console.warn('Could not fetch classes:', classError);
      }

      try {
        const feeHeadResponse = await feecreateService.getAllFeeHeads();
        if (feeHeadResponse.data?.fee_heads) {
          setFeeHeads(feeHeadResponse.data.fee_heads);
        } else if (feeHeadResponse.data?.data?.fee_heads) {
          setFeeHeads(feeHeadResponse.data.data.fee_heads);
        } else if (Array.isArray(feeHeadResponse.data)) {
          setFeeHeads(feeHeadResponse.data);
        }
      } catch (feeHeadError) {
        console.warn('Could not fetch fee heads:', feeHeadError);
      }

      const totalStructures   = feesData.length;
      const activeFees        = feesData.length;
      const estimatedRevenue  = feesData.reduce((sum, fee) => {
        return sum + parseFloat(fee.total_amount || fee.base_amount || 0);
      }, 0);

      setSummary({ totalStructures, activeFees, estimatedRevenue });

    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message.includes('Session expired') || error.message.includes('Authentication')) {
        setAuthError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fees];

    if (filters.academicYear) {
      filtered = filtered.filter(fee => fee.academic_year === filters.academicYear);
    }
    if (filters.classId) {
      filtered = filtered.filter(fee => fee.class_id === parseInt(filters.classId));
    }
    if (filters.feeHeadId) {
      filtered = filtered.filter(fee => fee.fee_head_id === parseInt(filters.feeHeadId));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(fee =>
        (fee.class_name?.toLowerCase()     || '').includes(searchLower) ||
        (fee.fee_head_name?.toLowerCase()  || '').includes(searchLower) ||
        (fee.fee_frequency?.toLowerCase()  || '').includes(searchLower)
      );
    }

    setFilteredFees(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const confirmDelete = (fee) => {
    setFeeToDelete(fee);
    setShowDeleteModal(true);
    setDeleteError('');
    setDeleteSuccess('');
  };

  const handleDeleteFee = async () => {
    if (!feeToDelete || !feeToDelete.fee_id) {
      setDeleteError('Invalid fee structure selected');
      return;
    }

    try {
      setDeletingId(feeToDelete.fee_id);
      setDeleteError('');

      console.log('🗑️ Deleting fee with ID:', feeToDelete.fee_id);

      await feecreateService.deleteFee(feeToDelete.fee_id);

      setFees(prev => prev.filter(fee => fee.fee_id !== feeToDelete.fee_id));
      setDeleteSuccess('✅ Fee structure deleted successfully!');

      setTimeout(() => {
        setShowDeleteModal(false);
        setFeeToDelete(null);
        setDeleteSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error deleting fee:', error);
      setDeleteError(error.message || 'Failed to delete fee structure');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setFilters({ academicYear: '', classId: '', feeHeadId: '', search: '' });
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount || 0);
    return new Intl.NumberFormat('en-IN', {
      style:                 'currency',
      currency:              'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  if (loading && fees.length === 0 && !authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fee structures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full">

        {/* Header */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fee Structure List</h1>
              <p className="text-gray-700 mt-1">
                Manage all assigned fee structures for your institution
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/fees/create')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              Create New Structure
            </button>
          </div>
        </div>

        {/* Authentication Error */}
        {authError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Authentication Required</h3>
                <p className="text-red-700 mt-1">{authError}</p>
                <button
                  onClick={handleLoginRedirect}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        )}

        {!authError && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Structures</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-bold">{summary.totalStructures}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.totalStructures}</p>
                <p className="text-gray-500 text-sm mt-1">All fee structures</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Active Fees</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.activeFees}</p>
                <p className="text-gray-500 text-sm mt-1">Currently assigned</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Estimated Revenue</h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl font-bold">₹</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.estimatedRevenue)}</p>
                <p className="text-gray-500 text-sm mt-1">Total expected</p>
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* ✅ Academic Year Filter — Dynamic from API */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  {yearsLoading ? (
                    <div className="w-full h-[42px] px-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </div>
                  ) : (
                    <select
                      value={filters.academicYear}
                      onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">All Years</option>
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={filters.classId}
                    onChange={(e) => handleFilterChange('classId', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name || `Class ${cls.class_id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee Head Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Head
                  </label>
                  <select
                    value={filters.feeHeadId}
                    onChange={(e) => handleFilterChange('feeHeadId', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">All Fee Heads</option>
                    {feeHeads.map(head => (
                      <option key={head.fee_head_id} value={head.fee_head_id}>
                        {head.head_name || `Fee Head ${head.fee_head_id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by class or fee head..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Class Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fee Head</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Base Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Academic Year</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="w-12 h-12 text-gray-400" />
                            <div>
                              <p className="text-gray-900 font-medium text-lg">No fee structures found</p>
                              <p className="text-gray-500 text-sm mt-1">
                                {fees.length > 0 ? 'Try adjusting your filters' : 'Create your first fee structure'}
                              </p>
                            </div>
                            {fees.length === 0 && (
                              <button
                                onClick={() => navigate('/admin/fees/create')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Create Fee Structure
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredFees.map((fee) => (
                        <tr key={fee.fee_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {fee.class_name || `Class ${fee.class_id}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {fee.fee_head_name || `Fee Head ${fee.fee_head_id}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {fee.fee_frequency?.replace('_', ' ') || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(fee.base_amount)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(fee.total_amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {fee.academic_year || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => confirmDelete(fee)}
                              disabled={deletingId === fee.fee_id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              {deletingId === fee.fee_id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Stats */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium text-gray-900">{filteredFees.length}</span> of{' '}
                    <span className="font-medium text-gray-900">{fees.length}</span> fee structures
                  </p>
                  {filters.academicYear || filters.classId || filters.feeHeadId || filters.search ? (
                    <p className="text-sm text-blue-600">
                      Filters applied: {[
                        filters.academicYear && `Year: ${filters.academicYear}`,
                        filters.classId      && `Class: ${classes.find(c => c.class_id == filters.classId)?.class_name || filters.classId}`,
                        filters.feeHeadId    && `Fee Head: ${feeHeads.find(f => f.fee_head_id == filters.feeHeadId)?.head_name || filters.feeHeadId}`,
                        filters.search       && `Search: "${filters.search}"`
                      ].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && feeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Fee Structure</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-800 mb-3">
                Are you sure you want to delete the fee structure for{' '}
                <span className="font-semibold">{feeToDelete.class_name || `Class ${feeToDelete.class_id}`}</span>?
              </p>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Fee Head:</span> {feeToDelete.fee_head_name}</p>
                <p><span className="font-medium">Amount:</span> {formatCurrency(feeToDelete.total_amount)}</p>
                <p><span className="font-medium">Academic Year:</span> {feeToDelete.academic_year}</p>
              </div>
            </div>

            {deleteSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">{deleteSuccess}</p>
                    <p className="text-green-600 text-xs mt-1">Modal will close automatically...</p>
                  </div>
                </div>
              </div>
            )}

            {deleteError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">{deleteError}</p>
                    {deleteError.includes('already assigned to students') && (
                      <p className="text-red-700 text-sm mt-2">
                        Please deactivate the fee instead of deleting it.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFeeToDelete(null);
                  setDeleteError('');
                  setDeleteSuccess('');
                }}
                disabled={!!deletingId}
                className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                {deleteSuccess ? 'Close' : 'Cancel'}
              </button>
              {!deleteSuccess && (
                <button
                  onClick={handleDeleteFee}
                  disabled={!!deletingId}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeList;