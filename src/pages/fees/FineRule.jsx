import React, { useState, useEffect } from 'react'; 
import { FiEdit2, FiTrash2, FiSave, FiX, FiSearch, FiCheckCircle, FiList } from 'react-icons/fi';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { feeFineRuleService } from '../../services/feeallService/feeFineRuleService';
import { feeHeadService } from '../../services/feeallService/feeHeadService';

const FineRule = () => {
  // State for fine rules data
  const [fineRules, setFineRules] = useState([]);
  
  // State for fee heads (fetched from API)
  const [feeHeads, setFeeHeads] = useState([]);
  
  // Form states
  const [newFineRule, setNewFineRule] = useState({
    rule_name: '',
    fine_type: 'per_day',
    fine_amount: '',
    grace_period_days: '',
    max_fine_cap: '',
    applicable_to: 'all_fees',
    fee_head_id: ''
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch fine rules and fee heads on component mount
  useEffect(() => {
    fetchFineRules();
    fetchFeeHeads();
  }, []);

  // Fetch all fee heads from API
  const fetchFeeHeads = async () => {
    try {
      const response = await feeHeadService.getAllFeeHeads();
      console.log('📥 fetchFeeHeads response:', response);
      
      if (response.success === true && response.data) {
        const feeHeadsArray = response.data.fee_heads || response.data || [];
        setFeeHeads(feeHeadsArray);
      } else {
        setFeeHeads([]);
      }
    } catch (err) {
      console.error('❌ Error fetching fee heads:', err);
      setFeeHeads([]);
    }
  };

  // Fetch all fine rules
  const fetchFineRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeFineRuleService.getAllFineRules();
      console.log('📥 fetchFineRules response:', response);
      
      if (response.success === true && response.data) {
        let fineRulesArray = response.data.fine_rules || response.data || [];
        
        // ✅ FIX: Normalize backend response - convert 'specific_fee_head' to 'specific_fee' for frontend
        fineRulesArray = fineRulesArray.map(rule => ({
          ...rule,
          applicable_to: rule.applicable_to === 'specific_fee_head' 
            ? 'specific_fee' 
            : (rule.applicable_to || 'all_fees')
        }));
        
        setFineRules(fineRulesArray);
      } else {
        setFineRules([]);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load fine rules';
      setError(errorMsg);
      console.error('❌ Error fetching fine rules:', err);
      setFineRules([]);
    } finally {
      setLoading(false);
    }
  };

  // Get fee head name by ID
  const getFeeHeadName = (feeHeadId) => {
    if (!feeHeadId) return null;
    // ✅ FIX: Ensure feeHeadId is properly converted to number
    const id = typeof feeHeadId === 'string' ? parseInt(feeHeadId) : feeHeadId;
    const feeHead = feeHeads.find(fh => fh.fee_head_id === id);
    return feeHead ? feeHead.head_name : null;
  };

  // Filter fine rules based on search
  const filteredFineRules = fineRules.filter(fineRule =>
    fineRule.rule_name && fineRule.rule_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFineRules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFineRules.length / itemsPerPage);

  // Success message handler
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFineRule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle applicable_to change
  const handleApplicableToChange = (e) => {
    const value = e.target.value;
    setNewFineRule(prev => ({
      ...prev,
      applicable_to: value,
      fee_head_id: value === 'all_fees' ? '' : prev.fee_head_id
    }));
  };

  // Handle fee head selection
  const handleFeeHeadChange = (e) => {
    const selectedId = e.target.value;
    setNewFineRule(prev => ({
      ...prev,
      fee_head_id: selectedId
    }));
  };

  // Add new fine rule
  const handleAddFineRule = async () => {
    // Validation
    if (!newFineRule.rule_name.trim()) {
      alert('Please enter rule name');
      return;
    }

    if (!newFineRule.fine_amount || parseFloat(newFineRule.fine_amount) <= 0) {
      alert('Please enter valid fine amount');
      return;
    }

    // ✅ FIX: Changed from 'specific_fee' to 'specific_fee_head'
    if (newFineRule.applicable_to === 'specific_fee_head' && !newFineRule.fee_head_id) {
      alert('Please select a fee head');
      return;
    }

    // Validate max_fine_cap if provided
    if (newFineRule.max_fine_cap && newFineRule.max_fine_cap.trim() !== '') {
      const maxCap = parseFloat(newFineRule.max_fine_cap);
      const fineAmount = parseFloat(newFineRule.fine_amount);
      
      if (!isNaN(maxCap) && maxCap < fineAmount) {
        alert('Maximum fine cap cannot be less than fine amount');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      // ✅ FIX: Backend expects 'specific_fee_head' not 'specific_fee'
      const payload = {
        rule_name: newFineRule.rule_name.trim(),
        fine_type: newFineRule.fine_type,
        fine_amount: parseFloat(newFineRule.fine_amount),
        grace_period_days: parseInt(newFineRule.grace_period_days) || 0,
        applicable_to: newFineRule.applicable_to === 'all_fees' 
          ? 'all_fees' 
          : 'specific_fee_head' // Backend format
      };

      // Add max_fine_cap only if it's a valid number AND greater than or equal to fine_amount
      if (newFineRule.max_fine_cap && newFineRule.max_fine_cap.trim() !== '') {
        const maxCap = parseFloat(newFineRule.max_fine_cap);
        if (!isNaN(maxCap) && maxCap > 0) {
          payload.max_fine_cap = maxCap;
        }
      }

      // ✅ FIX: Add fee_head_id ONLY if applicable_to is "specific_fee_head"
      if (newFineRule.applicable_to === 'specific_fee_head') {
        payload.fee_head_id = parseInt(newFineRule.fee_head_id);
      }

      console.log('📤 Create payload:', payload);

      const response = await feeFineRuleService.createFineRule(payload);
      
      if (response.success) {
        console.log('✅ Create successful:', response);
        await fetchFineRules();
        
        // Reset form
        setNewFineRule({
          rule_name: '',
          fine_type: 'per_day',
          fine_amount: '',
          grace_period_days: '',
          max_fine_cap: '',
          applicable_to: 'all_fees',
          fee_head_id: ''
        });

        showSuccessMessage(response.message || 'Fine rule has been successfully created.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create fine rule';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
      console.error('❌ Error creating fine rule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const handleEdit = (id) => {
    const fineRule = fineRules.find(f => f.fine_rule_id === id || f.id === id);
    if (fineRule) {
      console.log('Editing fine rule:', fineRule);
      setEditForm({ 
        ...fineRule,
        applicable_to: fineRule.applicable_to === 'specific_fee_head' 
          ? 'specific_fee' 
          : (fineRule.applicable_to || 'all_fees'), // Normalize for frontend
        fine_amount: parseFloat(fineRule.fine_amount) || '',
        grace_period_days: parseInt(fineRule.grace_period_days) || '',
        max_fine_cap: fineRule.max_fine_cap ? parseFloat(fineRule.max_fine_cap) : '',
        fee_head_id: fineRule.fee_head_id || '',
        fine_rule_id: fineRule.fine_rule_id || fineRule.id
      });
      setEditingId(id);
    }
  };

  // Save edited fine rule
  const handleSave = async (id) => {
    if (!editForm.rule_name || !editForm.rule_name.trim()) {
      alert('Rule name is required');
      return;
    }

    if (!editForm.fine_amount || parseFloat(editForm.fine_amount) <= 0) {
      alert('Please enter valid fine amount');
      return;
    }

    // ✅ FIX: Changed from 'specific_fee' to 'specific_fee_head'
    if (editForm.applicable_to === 'specific_fee_head' && !editForm.fee_head_id) {
      alert('Please select a fee head for specific fee type');
      return;
    }

    // Validate max_fine_cap if provided
    if (editForm.max_fine_cap && editForm.max_fine_cap.toString().trim() !== '') {
      const maxCap = parseFloat(editForm.max_fine_cap);
      const fineAmount = parseFloat(editForm.fine_amount);
      
      if (!isNaN(maxCap) && maxCap < fineAmount) {
        alert('Maximum fine cap cannot be less than fine amount');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      // ✅ FIX: Convert frontend 'specific_fee' to backend 'specific_fee_head'
      const payload = {
        fine_rule_id: id,
        rule_name: editForm.rule_name.trim(),
        fine_type: editForm.fine_type,
        fine_amount: parseFloat(editForm.fine_amount),
        grace_period_days: parseInt(editForm.grace_period_days) || 0,
        applicable_to: editForm.applicable_to === 'all_fees' 
          ? 'all_fees' 
          : 'specific_fee_head' // Backend format
      };

      // Add max_fine_cap only if it's a valid number AND greater than or equal to fine_amount
      if (editForm.max_fine_cap && editForm.max_fine_cap.toString().trim() !== '') {
        const maxCap = parseFloat(editForm.max_fine_cap);
        if (!isNaN(maxCap) && maxCap > 0) {
          payload.max_fine_cap = maxCap;
        }
      }

      // ✅ FIX: Add fee_head_id ONLY if applicable_to is "specific_fee_head"
      if (editForm.applicable_to === 'specific_fee_head' && editForm.fee_head_id) {
        payload.fee_head_id = parseInt(editForm.fee_head_id);
      }

      console.log('📤 Update payload:', payload);

      const response = await feeFineRuleService.updateFineRule(payload);
      
      if (response.success) {
        console.log('✅ Update successful:', response);
        await fetchFineRules();
        setEditingId(null);
        showSuccessMessage(response.message || 'Fine rule updated successfully.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update fine rule';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
      console.error('❌ Error updating fine rule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
  };

  // Delete fine rule
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fine rule?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await feeFineRuleService.deleteFineRule(id);
      
      if (response.success) {
        console.log('✅ Delete successful:', response);
        await fetchFineRules();
        showSuccessMessage(response.message || 'Fine rule deleted successfully.');
        
        if (currentPage > 1 && currentItems.length === 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete fine rule';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
      console.error('❌ Error deleting fine rule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit applicable_to change
  const handleEditApplicableToChange = (value) => {
    setEditForm(prev => ({
      ...prev,
      applicable_to: value,
      fee_head_id: value === 'all_fees' ? '' : prev.fee_head_id
    }));
  };

  // Handle edit fee head selection
  const handleEditFeeHeadChange = (e) => {
    const selectedId = e.target.value;
    setEditForm(prev => ({
      ...prev,
      fee_head_id: selectedId
    }));
  };

  // Fine type badge color
  const getFineTypeColor = (type) => {
    switch(type) {
      case 'per_day': return 'bg-blue-100 text-black border border-blue-200';
      case 'flat_monthly': return 'bg-purple-100 text-black border border-purple-200';
      case 'percentage': return 'bg-yellow-100 text-black border border-yellow-200';
      default: return 'bg-gray-100 text-black border border-gray-200';
    }
  };

  // Applicable to badge color
  const getApplicableToColor = (type) => {
    const actualType = type || 'all_fees';
    // ✅ FIX: Handle both 'specific_fee' and 'specific_fee_head'
    if (actualType === 'all_fees') {
      return 'bg-green-100 text-black border border-green-200';
    } else if (actualType === 'specific_fee' || actualType === 'specific_fee_head') {
      return 'bg-blue-100 text-black border border-blue-200';
    }
    return 'bg-gray-100 text-black border border-gray-200';
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

  // Format amount with currency symbol
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === '') return 'N/A';
    const num = parseFloat(amount);
    return isNaN(num) ? 'N/A' : `₹${num.toFixed(2)}`;
  };

  // Format fine type for display
  const formatFineType = (type) => {
    switch(type) {
      case 'per_day': return 'Per Day';
      case 'flat_monthly': return 'Fixed Amount';
      case 'percentage': return 'Percentage';
      default: return type || 'N/A';
    }
  };

  // Format applicable to for display
  const formatApplicableTo = (type, feeHeadId) => {
    // ✅ FIX: Normalize type for display
    const actualType = type || 'all_fees';
    
    if (actualType === 'all_fees') {
      return 'All Fees';
    } else if (actualType === 'specific_fee' || actualType === 'specific_fee_head') {
      const feeHeadName = getFeeHeadName(feeHeadId);
      return feeHeadName ? ` ${feeHeadName}` : 'Specific Fee Head';
    }
    return actualType || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Fine Rules Management</h1>
        <p className="text-black mt-2">Configure and manage fine rules for late fee payments.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fade-in">
          <div className="flex items-center">
            <div>
              <p className="text-black font-medium">Error</p>
              <p className="text-black text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create New Fine Rule Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-6 border-b pb-3">Create New Fine Rule</h2>
        
        <div className="space-y-6">
          {/* Row 1: Rule Name, Fine Type, Fine Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rule Name */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                name="rule_name"
                value={newFineRule.rule_name}
                onChange={handleInputChange}
                placeholder="e.g. Late Payment Fine"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500"
              />
            </div>

            {/* Fine Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Fine Type *
              </label>
              <select
                name="fine_type"
                value={newFineRule.fine_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black"
              >
                <option value="per_day">Per Day</option>
                <option value="flat_monthly">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            {/* Fine Amount */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Fine Amount *
              </label>
              <input
                type="number"
                name="fine_amount"
                value={newFineRule.fine_amount}
                onChange={handleInputChange}
                placeholder="e.g. 10.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500"
              />
            </div>
          </div>

          {/* Row 2: Grace Period, Max Fine Cap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grace Period Days */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Grace Period (Days)
              </label>
              <input
                type="number"
                name="grace_period_days"
                value={newFineRule.grace_period_days}
                onChange={handleInputChange}
                placeholder="e.g. 5"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500"
              />
            </div>

            {/* Max Fine Cap */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Maximum Fine Cap (Optional)
              </label>
              <input
                type="number"
                name="max_fine_cap"
                value={newFineRule.max_fine_cap}
                onChange={handleInputChange}
                placeholder="e.g. 1000.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500"
              />
            </div>
          </div>

          {/* Row 3: Applicable To */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-black mb-2">
              Applicable To *
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="applicable_to"
                  value="all_fees"
                  checked={newFineRule.applicable_to === 'all_fees'}
                  onChange={handleApplicableToChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-black">All Fees</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="applicable_to"
                  value="specific_fee_head" // ✅ FIX: Changed to backend format
                  checked={newFineRule.applicable_to === 'specific_fee_head'}
                  onChange={handleApplicableToChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-black">Specific Fee Head</span>
              </label>
            </div>

            {/* Fee Head Dropdown (Conditional) */}
            {newFineRule.applicable_to === 'specific_fee_head' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Select Fee Head *
                </label>
                <select
                  value={newFineRule.fee_head_id}
                  onChange={handleFeeHeadChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black"
                >
                  <option value="">Select a fee head</option>
                  {feeHeads.map(feeHead => (
                    <option key={feeHead.fee_head_id} value={feeHead.fee_head_id}>
                      {feeHead.head_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 4: Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Button */}
            <div>
              <button
                onClick={handleAddFineRule}
                disabled={loading || !newFineRule.rule_name.trim() || !newFineRule.fine_amount}
                className={`w-full flex items-center justify-center gap-2 ${
                  loading || !newFineRule.rule_name.trim() || !newFineRule.fine_amount
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Add Fine Rule'
                )}
              </button>
            </div>

            {/* Show List Button */}
            <div>
              <button
                onClick={() => setShowList(!showList)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 px-6 rounded-lg transition duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-sm"
              >
                <FiList className="text-lg" />
                {showList ? 'Hide List' : 'Show List'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded animate-fade-in">
          <div className="flex items-center">
            <FiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-black font-medium">Success!</p>
              <p className="text-black text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-black">Loading...</p>
          </div>
        </div>
      )}

      {/* Fine Rules List */}
      {showList && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b bg-gray-50">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fine rules..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-black placeholder-gray-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider whitespace-nowrap">RULE NAME</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">FINE TYPE</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">AMOUNT</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">GRACE DAYS</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">MAX CAP</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">APPLICABLE TO</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-black uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((fineRule) => (
                    <tr key={fineRule.fine_rule_id || fineRule.id} className="hover:bg-gray-50 transition-colors">
                      {editingId === (fineRule.fine_rule_id || fineRule.id) ? (
                        // Edit Mode Row
                        <>
                          <td className="py-4 px-6">
                            <input
                              type="text"
                              value={editForm.rule_name || ''}
                              onChange={(e) => handleEditFormChange('rule_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                              placeholder="Rule Name"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={editForm.fine_type || 'per_day'}
                              onChange={(e) => handleEditFormChange('fine_type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                            >
                              <option value="per_day">Per Day</option>
                              <option value="flat_monthly">Fixed Amount</option>
                              <option value="percentage">Percentage</option>
                            </select>
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="number"
                              value={editForm.fine_amount || ''}
                              onChange={(e) => handleEditFormChange('fine_amount', e.target.value)}
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                              placeholder="Amount"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="number"
                              value={editForm.grace_period_days || ''}
                              onChange={(e) => handleEditFormChange('grace_period_days', e.target.value)}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                              placeholder="Grace Days"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="number"
                              value={editForm.max_fine_cap || ''}
                              onChange={(e) => handleEditFormChange('max_fine_cap', e.target.value)}
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                              placeholder="Max Cap"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex space-x-4">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={editForm.applicable_to === 'all_fees'}
                                    onChange={() => handleEditApplicableToChange('all_fees')}
                                    className="h-3 w-3 text-blue-600"
                                  />
                                  <span className="text-xs text-black">All Fees</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={editForm.applicable_to === 'specific_fee_head'}
                                    onChange={() => handleEditApplicableToChange('specific_fee_head')}
                                    className="h-3 w-3 text-blue-600"
                                  />
                                  <span className="text-xs text-black">Specific</span>
                                </label>
                              </div>
                              {editForm.applicable_to === 'specific_fee_head' && (
                                <select
                                  value={editForm.fee_head_id || ''}
                                  onChange={handleEditFeeHeadChange}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-black"
                                >
                                  <option value="">Select Fee Head</option>
                                  {feeHeads.map(feeHead => (
                                    <option key={feeHead.fee_head_id} value={feeHead.fee_head_id}>
                                      {feeHead.head_name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSave(fineRule.fine_rule_id || fineRule.id)}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                              >
                                <FiSave size={14} />
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition text-sm"
                              >
                                <FiX size={14} />
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode Row
                        <>
                          <td className="py-4 px-6">
                            <span className="font-medium text-black">{fineRule.rule_name || 'N/A'}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getFineTypeColor(fineRule.fine_type)}`}>
                              {formatFineType(fineRule.fine_type)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-black font-medium">
                              {formatAmount(fineRule.fine_amount)}
                              {fineRule.fine_type === 'percentage' && '%'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-black">{fineRule.grace_period_days || '0'}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-black">
                              {fineRule.max_fine_cap ? formatAmount(fineRule.max_fine_cap) : 'No limit'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getApplicableToColor(fineRule.applicable_to)}`}>
                              {formatApplicableTo(fineRule.applicable_to, fineRule.fee_head_id)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(fineRule.fine_rule_id || fineRule.id)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(fineRule.fine_rule_id || fineRule.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
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
                    <td colSpan="7" className="py-8 px-6 text-center text-black">
                      {loading ? 'Loading fine rules...' : 'No fine rules found. ' + (searchTerm ? 'Try a different search term.' : 'Create your first fine rule above.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-black">
              Showing <span className="font-medium text-black">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium text-black">
                {Math.min(indexOfLastItem, filteredFineRules.length)}
              </span>{" "}
              of <span className="font-medium text-black">{filteredFineRules.length}</span> entries
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1 || loading}
                className={`flex items-center gap-1 px-3 py-2 rounded border text-sm ${
                  currentPage === 1 || loading
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
                  if (index === 0 && pageNumber > 1) {
                    return (
                      <React.Fragment key="start-ellipsis">
                        <button
                          onClick={() => goToPage(1)}
                          disabled={loading}
                          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                            loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                              : 'bg-white text-black hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          1
                        </button>
                        {pageNumber > 2 && <span className="text-black px-1">...</span>}
                      </React.Fragment>
                    );
                  }

                  if (index === getPageNumbers().length - 1 && pageNumber < totalPages) {
                    return (
                      <React.Fragment key="end-ellipsis">
                        {pageNumber < totalPages - 1 && <span className="text-black px-1">...</span>}
                        <button
                          onClick={() => goToPage(totalPages)}
                          disabled={loading}
                          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                            loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                              : 'bg-white text-black hover:bg-gray-100 border border-gray-300'
                          }`}
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
                      disabled={loading}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : loading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
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
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className={`flex items-center gap-1 px-3 py-2 rounded border text-sm ${
                  currentPage === totalPages || totalPages === 0 || loading
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

export default FineRule;