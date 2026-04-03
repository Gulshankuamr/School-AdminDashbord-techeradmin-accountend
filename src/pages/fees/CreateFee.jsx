// src/pages/CreateFee.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Copy, Calendar, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feecreateService } from '../../services/feeallService/feecreateService';

const CreateFee = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    academicYear: '',
    classId: '',
    feeHeadId: '',
    baseAmount: '',
    feeFrequency: 'monthly',
    startDueDate: '',
    endDueDate: '',
  });

  // Data from APIs
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Academic Years from API
  const [academicYears, setAcademicYears]   = useState([]);
  const [yearsLoading,  setYearsLoading]    = useState(true);

  // Installment state
  const [installments, setInstallments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isGeneratingInstallments, setIsGeneratingInstallments] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authError, setAuthError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Payment frequency options
  const frequencyOptions = [
    { value: 'monthly',     label: 'Monthly'     },
    { value: 'quarterly',   label: 'Quarterly'   },
    { value: 'half_yearly', label: 'Half-Yearly' },
    { value: 'one_time',    label: 'One-Time'    },
  ];

  // ✅ Load Academic Years from API on mount
  useEffect(() => {
    feecreateService.getAcademicYears()
      .then(years => {
        setAcademicYears(years);
        if (years.length) setFormData(prev => ({ ...prev, academicYear: years[0] }));
      })
      .catch(e => setError(e.message || 'Failed to load academic years'))
      .finally(() => setYearsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setAuthError('');

      const classResponse = await feecreateService.getAllClasses();
      if (classResponse.data && Array.isArray(classResponse.data)) {
        setClasses(classResponse.data);
      } else {
        console.warn('Unexpected classes response structure:', classResponse);
      }

      const feeHeadResponse = await feecreateService.getAllFeeHeads();
      if (feeHeadResponse.data?.fee_heads) {
        setFeeHeads(feeHeadResponse.data.fee_heads);
      } else if (feeHeadResponse.data?.data?.fee_heads) {
        setFeeHeads(feeHeadResponse.data.data.fee_heads);
      } else if (Array.isArray(feeHeadResponse.data)) {
        setFeeHeads(feeHeadResponse.data);
      } else {
        console.warn('Unexpected fee heads response structure:', feeHeadResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message.includes('Session expired') || error.message.includes('Authentication')) {
        setAuthError(error.message);
      } else {
        setError(`Failed to load data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateInstallments = () => {
    const baseAmount = parseFloat(formData.baseAmount) || 0;
    if (!baseAmount || baseAmount <= 0) {
      setError('Please enter a valid base amount first');
      return;
    }
    if (!formData.feeFrequency) {
      setError('Please select payment frequency');
      return;
    }

    setIsGeneratingInstallments(true);
    setError('');

    const [sY, sM, sD] = formData.startDueDate.split('-').map(Number);
    const [eY, eM, eD] = formData.endDueDate.split('-').map(Number);

    const toDateStr = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const addMonths = (year, month0, n) => {
      const total = month0 + n;
      return { year: year + Math.floor(total / 12), month: total % 12 };
    };

    const clampDay = (year, month0, day) => {
      const max = new Date(year, month0 + 1, 0).getDate();
      return Math.min(day, max);
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    const freqConfig = {
      monthly:     { count: 12, step: 1, name: 'Monthly Installment'     },
      quarterly:   { count: 4,  step: 3, name: 'Quarterly Installment'   },
      half_yearly: { count: 2,  step: 6, name: 'Half-Yearly Installment' },
      one_time:    { count: 1,  step: 0, name: 'One-Time Fee'            },
    };

    const config = freqConfig[formData.feeFrequency] || freqConfig['monthly'];
    const newInstallments = [];

    for (let i = 0; i < config.count; i++) {
      const instStart    = addMonths(sY, sM - 1, i * config.step);
      const instStartDay = clampDay(instStart.year, instStart.month, sD);
      const instStartDate = new Date(instStart.year, instStart.month, instStartDay);

      const instEnd    = addMonths(eY, eM - 1, i * config.step);
      const instEndDay = clampDay(instEnd.year, instEnd.month, eD);
      const instEndDate = new Date(instEnd.year, instEnd.month, instEndDay);

      const dueDateStr = toDateStr(instStartDate);
      const endDateStr = toDateStr(instEndDate);

      newInstallments.push({
        id:          i + 1,
        name:        `${config.name} ${i + 1}`,
        month:       months[instStart.month],
        year:        instStart.year,
        amount:      baseAmount.toFixed(2),
        dueDate:     dueDateStr,
        startDate:   dueDateStr,
        endDate:     endDateStr,
        displayDate: `${months[instStart.month].substring(0, 3)} ${instStart.year}`
      });
    }

    setInstallments(newInstallments);
    setTotalAmount(baseAmount * newInstallments.length);
    setIsGeneratingInstallments(false);

    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'feeFrequency' || field === 'baseAmount') {
      setInstallments([]);
      setTotalAmount(0);
    }
    setError('');
    setSuccess('');
  };

  const handleInstallmentChange = (index, field, value) => {
    const newInstallments = [...installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setInstallments(newInstallments);
    const newTotal = newInstallments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    setTotalAmount(newTotal);
  };

  const handlePreviewClick = () => {
    if (!formData.startDueDate) {
      setError('Please select a Start Due Date');
      return;
    }
    if (!formData.endDueDate) {
      setError('Please select an End Due Date');
      return;
    }
    if (formData.endDueDate < formData.startDueDate) {
      setError('End Due Date cannot be before Start Due Date');
      return;
    }
    generateInstallments();
  };

  const handleConfirmCreate = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        class_id:       parseInt(formData.classId),
        fee_head_id:    parseInt(formData.feeHeadId),
        base_amount:    formData.baseAmount,
        fee_frequency:  formData.feeFrequency,
        academic_year:  formData.academicYear,
        start_due_date: formData.startDueDate,
        end_due_date:   formData.endDueDate,
      };

      console.log('🚀 Creating fee with payload:', payload);

      const response = await feecreateService.createFee(payload);

      if (response.success) {
        setShowConfirmModal(false);
        setSuccess('✅ Fee structure created successfully!');

        setFormData({
          academicYear:  academicYears[0] || '',
          classId:       '',
          feeHeadId:     '',
          baseAmount:    '',
          feeFrequency:  'monthly',
          startDueDate:  '',
          endDueDate:    '',
        });
        setInstallments([]);
        setTotalAmount(0);

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          navigate('/admin/fees/create');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating fee:', error);
      setError(error.message || 'Failed to create fee structure. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style:                 'currency',
      currency:              'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Fee Structure</h1>
              <p className="text-gray-700 mt-1">
                Define how fees are collected for the upcoming academic session
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/fees/preview')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 w-full md:w-auto"
            >
              View All Structures
              <span className="text-lg">→</span>
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

        {/* Error/Success Messages */}
        {error && !authError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-700 text-sm mt-1">{success}</p>
                <p className="text-green-600 text-xs mt-2">Redirecting to fee list in 3 seconds...</p>
              </div>
            </div>
          </div>
        )}

        {!authError && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Form */}
              <div className="lg:col-span-2 space-y-6">

                {/* Step 1 - Fee Configuration */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <span className="font-medium">1</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Fee Configuration</h2>
                      <p className="text-gray-700 mt-1">Select academic year, class and fee head</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* ✅ Academic Year — Dynamic from API */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Academic Year *
                      </label>
                      {yearsLoading ? (
                        <div className="w-full h-[42px] px-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2 text-sm text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={formData.academicYear}
                            onChange={(e) => handleInputChange('academicYear', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                            disabled={loading}
                          >
                            {academicYears.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      )}
                    </div>

                    {/* Class/Grade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Class / Grade *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.classId}
                          onChange={(e) => handleInputChange('classId', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                          disabled={loading}
                        >
                          <option value="">Select Class</option>
                          {classes.map(cls => (
                            <option key={cls.class_id} value={cls.class_id}>
                              {cls.class_name || `Class ${cls.class_id}`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Fee Head */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Fee Head *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.feeHeadId}
                          onChange={(e) => handleInputChange('feeHeadId', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                          disabled={loading}
                        >
                          <option value="">Select Fee Head</option>
                          {feeHeads.map(head => (
                            <option key={head.fee_head_id} value={head.fee_head_id}>
                              {head.head_name || `Fee Head ${head.fee_head_id}`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 - Financial Details */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <span className="font-medium">2</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Financial Details</h2>
                      <p className="text-gray-700 mt-1">Set payment frequency, base amount and due dates</p>
                    </div>
                  </div>

                  {/* Payment Frequency */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Payment Frequency *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {frequencyOptions.map(freq => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => handleInputChange('feeFrequency', freq.value)}
                          disabled={loading}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            formData.feeFrequency === freq.value
                              ? 'bg-blue-600 text-white border-2 border-blue-600'
                              : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Base Amount */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Base Amount (₹) *
                    </label>
                    <div className="relative max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-900">₹</span>
                      </div>
                      <input
                        type="number"
                        value={formData.baseAmount}
                        onChange={(e) => handleInputChange('baseAmount', e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-gray-700 text-sm mt-2">
                      Amount per installment (Based on selected frequency)
                    </p>
                  </div>

                  {/* Start & End Due Date Fields */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Due Date Range *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Start Due Date */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Start Due Date *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={formData.startDueDate}
                            onChange={(e) => handleInputChange('startDueDate', e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* End Due Date */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          End Due Date *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={formData.endDueDate}
                            onChange={(e) => handleInputChange('endDueDate', e.target.value)}
                            min={formData.startDueDate || ''}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      Defines the fee collection window for this structure.
                    </p>
                  </div>

                  {/* Total Amount Preview */}
                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 inline-block">
                      <p className="text-xs text-gray-700 mb-1">BASE AMOUNT PREVIEW</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formData.baseAmount
                          ? `₹${parseFloat(formData.baseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '₹0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <button
                    onClick={handlePreviewClick}
                    disabled={loading || !formData.baseAmount || isGeneratingInstallments}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingInstallments ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        Preview Installments
                        <span className="text-lg">↓</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Step 3 - Installment Schedule */}
                {installments.length > 0 && (
                  <div ref={previewRef} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-900 font-medium">
                          <span>3</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Preview Installment Schedule</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {installments.length} Installments
                            </span>
                            <span className="text-gray-700 text-sm">
                              Total: {formatCurrency(totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Installment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Month & Year</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Amount (₹)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Start Due Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">End Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {installments.map((inst, index) => (
                            <tr key={inst.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {String(inst.id).padStart(2, '0')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{inst.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{inst.displayDate}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={inst.amount}
                                  onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                                  className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  step="0.01"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                {inst.startDate}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                {inst.endDate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 text-sm text-gray-700">
                      <p>Note: Installment amounts and dates are editable. Changes only affect this preview.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Structure Summary</h3>

                  <div className="space-y-6">
                    {/* Total Fee */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-900">Total Fee</span>
                        <button
                          className="p-1 hover:bg-blue-100 rounded"
                          onClick={() => navigator.clipboard.writeText(totalAmount.toString())}
                          title="Copy amount"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Installments</span>
                        <span className="font-semibold text-gray-900">{installments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Frequency</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {formData.feeFrequency.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Base Amount</span>
                        <span className="font-semibold text-gray-900">
                          ₹{formData.baseAmount ? parseFloat(formData.baseAmount).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Academic Year</span>
                        <span className="font-semibold text-gray-900">{formData.academicYear}</span>
                      </div>

                      {formData.startDueDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">Start Due Date</span>
                          <span className="font-semibold text-gray-900 text-sm">{formData.startDueDate}</span>
                        </div>
                      )}
                      {formData.endDueDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">End Due Date</span>
                          <span className="font-semibold text-gray-900 text-sm">{formData.endDueDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-900">Remaining Balance</span>
                        <span className="font-semibold text-green-600">₹0.00</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <button
                        onClick={() => {
                          setInstallments([]);
                          setTotalAmount(0);
                          setFormData(prev => ({
                            ...prev,
                            baseAmount:   '',
                            startDueDate: '',
                            endDueDate:   '',
                          }));
                        }}
                        className="w-full px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      >
                        Edit Base Fee
                      </button>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={loading || installments.length === 0}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Confirm & Assign Fee
                            <span className="text-lg">→</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Note:</span> After confirming, the fee structure will be created and you'll be redirected to the fee list.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Fee Creation</h3>
                <p className="text-gray-700 text-sm">Are you sure you want to create this fee structure?</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Class:</span>
                  <span className="font-semibold text-gray-900">
                    {classes.find(c => c.class_id == formData.classId)?.class_name || `Class ${formData.classId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Fee Head:</span>
                  <span className="font-semibold text-gray-900">
                    {feeHeads.find(f => f.fee_head_id == formData.feeHeadId)?.head_name || `Fee Head ${formData.feeHeadId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Total Amount:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Start Due Date:</span>
                  <span className="font-semibold text-gray-900">{formData.startDueDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">End Due Date:</span>
                  <span className="font-semibold text-gray-900">{formData.endDueDate || '—'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFee;