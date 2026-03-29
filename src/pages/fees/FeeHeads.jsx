import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSave, FiX, FiSearch, FiCheckCircle, FiList } from 'react-icons/fi';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { feeHeadService } from '../../services/feeallService/feeHeadService';

const FeeHeads = () => {
  // State for fee heads data
  const [feeHeads, setFeeHeads] = useState([]);

  // Form states
  const [newFeeHead, setNewFeeHead] = useState({
    name: '',
    description: ''
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // UI states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states - 5 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // ===============================
  // 🔄 FETCH FEE HEADS ON MOUNT
  // ===============================
  useEffect(() => {
    fetchFeeHeads();
  }, []);

  // ===============================
  // 📥 FETCH ALL FEE HEADS
  // ===============================
  const fetchFeeHeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await feeHeadService.getAllFeeHeads();
      
      if (response.success && response.data && response.data.fee_heads) {
        // Transform API data to match component state structure
        const transformedData = response.data.fee_heads.map(feeHead => ({
          id: feeHead.fee_head_id,
          name: feeHead.head_name,
          description: feeHead.description || ''
        }));
        
        setFeeHeads(transformedData);
        console.log('✅ Fee heads loaded:', transformedData);
      }
    } catch (err) {
      console.error('Failed to fetch fee heads:', err);
      setError(err.message || 'Failed to load fee heads');
      showSuccessMessage('Error: Failed to load fee heads', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter fee heads based on search
  const filteredFeeHeads = feeHeads.filter(feeHead =>
    feeHead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feeHead.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeeHeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeeHeads.length / itemsPerPage);

  // Success message handler
  const showSuccessMessage = (message, type = 'success') => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // ===============================
  // ➕ ADD NEW FEE HEAD
  // ===============================
  const handleAddFeeHead = async () => {
    if (!newFeeHead.name.trim()) {
      alert('Please enter fee head name');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        name: newFeeHead.name.trim(),
        description: newFeeHead.description.trim()
      };

      const response = await feeHeadService.createFeeHead(payload);
      
      if (response.success) {
        // Reset form
        setNewFeeHead({
          name: '',
          description: ''
        });

        // Refresh list
        await fetchFeeHeads();
        
        showSuccessMessage('The fee head has been successfully saved.');
      }
    } catch (err) {
      console.error('Failed to create fee head:', err);
      
      // Check if it's a duplicate error
      if (err.message && err.message.includes('already exists')) {
        alert('A fee head with this name already exists.');
      } else {
        alert('Failed to create fee head: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✏️ START EDITING
  // ===============================
  const handleEdit = (id) => {
    const feeHead = feeHeads.find(f => f.id === id);
    setEditForm({ ...feeHead });
    setEditingId(id);
  };

  // ===============================
  // 💾 SAVE EDITED FEE HEAD
  // ===============================
  const handleSave = async (id) => {
    if (!editForm.name.trim()) {
      alert('Fee head name is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id: id,
        name: editForm.name.trim(),
        description: editForm.description.trim()
      };

      const response = await feeHeadService.updateFeeHead(payload);
      
      if (response.success) {
        setEditingId(null);
        
        // Refresh list
        await fetchFeeHeads();
        
        showSuccessMessage('Fee head updated successfully.');
      }
    } catch (err) {
      console.error('Failed to update fee head:', err);
      alert('Failed to update fee head: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ❌ CANCEL EDITING
  // ===============================
  const handleCancel = () => {
    setEditingId(null);
  };

  // ===============================
  // 🗑️ DELETE FEE HEAD
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee head?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await feeHeadService.deleteFeeHead(id);
      
      if (response.success) {
        // Adjust pagination if needed
        if (currentPage > 1 && currentItems.length === 1) {
          setCurrentPage(currentPage - 1);
        }

        // Refresh list
        await fetchFeeHeads();
        
        showSuccessMessage('Fee head deleted successfully.');
      }
    } catch (err) {
      console.error('Failed to delete fee head:', err);
      alert('Failed to delete fee head: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeeHead(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header - ALL BLACK TEXT */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Fee Heads Management</h1>
        <p className="text-black mt-2">Configure and manage various school fee categories and their collection rules.</p>
      </div>

      {/* Create New Fee Head Card - ALL BLACK TEXT */}
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
  <h2 className="text-xl font-semibold text-black mb-6 border-b pb-3">Create New Fee Head</h2>
  
  <div className="space-y-6">
    {/* Fee Head Name */}
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Fee Head Name
      </label>
      <input
        type="text"
        name="name"
        value={newFeeHead.name}
        onChange={handleInputChange}
        placeholder="e.g. Tuition Fee"
        disabled={loading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Description
      </label>
      <textarea
        name="description"
        value={newFeeHead.description}
        onChange={handleInputChange}
        placeholder="Provide a brief description of the fee purpose..."
        rows="3"
        disabled={loading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  </div>

  {/* Buttons - Side by Side */}
  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
    <button
      onClick={handleAddFeeHead}
      disabled={loading}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Adding...' : 'Add Fee Head'}
    </button>

    <button
      onClick={() => setShowList(!showList)}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 px-6 rounded-lg transition duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FiList className="text-lg" />
      {showList ? 'Hide List' : 'Show List'}
    </button>
  </div>
</div>

      {/* Success Message - ALL BLACK TEXT */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded animate-fade-in">
          <div className="flex items-center">
            <FiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-black font-medium">Success</p>
              <p className="text-black text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-black text-sm">Processing...</p>
          </div>
        </div>
      )}

      {/* Fee Heads List (Conditional Render) */}
      {showList && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Search Bar - ALL BLACK TEXT */}
          <div className="p-6 border-b bg-gray-50">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fee heads..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500"
              />
            </div>
          </div>

          {/* Table - ALL BLACK TEXT */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider whitespace-nowrap">FEE HEAD NAME</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">DESCRIPTION</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((feeHead) => (
                    <tr key={feeHead.id} className="hover:bg-gray-50 transition-colors">
                      {editingId === feeHead.id ? (
                        // Edit Mode Row - ALL BLACK TEXT
                        <>
                          <td className="py-4 px-6">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => handleEditFormChange('name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                              placeholder="Fee Head Name"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <textarea
                              value={editForm.description}
                              onChange={(e) => handleEditFormChange('description', e.target.value)}
                              rows="2"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                              placeholder="Description"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSave(feeHead.id)}
                                disabled={loading}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm disabled:bg-green-400 disabled:cursor-not-allowed"
                              >
                                <FiSave size={14} />
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiX size={14} />
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode Row - ALL BLACK TEXT
                        <>
                          <td className="py-4 px-6">
                            <span className="font-medium text-black">{feeHead.name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-black text-sm">
                              {feeHead.description.length > 60 
                                ? `${feeHead.description.substring(0, 60)}...` 
                                : feeHead.description}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(feeHead.id)}
                                disabled={loading}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(feeHead.id)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 px-6 text-center text-black">
                      {loading ? 'Loading...' : `No fee heads found. ${searchTerm && 'Try a different search term.'}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - ALL BLACK TEXT */}
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-black">
              Showing <span className="font-medium text-black">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium text-black">
                {Math.min(indexOfLastItem, filteredFeeHeads.length)}
              </span>{" "}
              of <span className="font-medium text-black">{filteredFeeHeads.length}</span> entries
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded border text-sm ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-white text-black hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                <HiOutlineChevronLeft size={16} />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNumber, index) => {
                  // Add ellipsis before first number if needed
                  if (index === 0 && pageNumber > 1) {
                    return (
                      <React.Fragment key="start-ellipsis">
                        <button
                          onClick={() => goToPage(1)}
                          className="w-8 h-8 flex items-center justify-center rounded text-sm bg-white text-black hover:bg-gray-100 border border-gray-300"
                        >
                          1
                        </button>
                        {pageNumber > 2 && <span className="text-black px-1">...</span>}
                      </React.Fragment>
                    );
                  }

                  // Add ellipsis after last number if needed
                  if (index === getPageNumbers().length - 1 && pageNumber < totalPages) {
                    return (
                      <React.Fragment key="end-ellipsis">
                        {pageNumber < totalPages - 1 && <span className="text-black px-1">...</span>}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="w-8 h-8 flex items-center justify-center rounded text-sm bg-white text-black hover:bg-gray-100 border border-gray-300"
                        >
                          {totalPages}
                        </button>
                      </React.Fragment>
                    );
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-black hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`flex items-center gap-1 px-3 py-2 rounded border text-sm ${
                  currentPage === totalPages || totalPages === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-white text-black hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                Next
                <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeHeads;