import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Users, Download
} from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

// ✅ Static academic years 2026-27 to 2032-33
const ACADEMIC_YEARS = Array.from({ length: 7 }, (_, i) => {
  const s = 2026 + i;
  const e = (s + 1).toString().slice(-2);
  return `${s}-${e}`;
});

const CollectFee = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({
    academicYear: '2026-27',
    className: '',
    sectionName: '',
    searchText: '',
  });

  useEffect(() => { fetchAllStudents(); }, []);
  useEffect(() => { applyFilters(); }, [filters, allStudents]);

  const fetchAllStudents = async () => {
    try {
      setIsLoading(true);
      const response = await feePaymentService.getAllStudents();
      if (response.data && Array.isArray(response.data)) {
        setAllStudents(response.data);
        setFilteredStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allStudents];
    if (filters.className) filtered = filtered.filter(s => s.class_name === filters.className);
    if (filters.sectionName) filtered = filtered.filter(s => s.section_name === filters.sectionName);
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(q) || s.admission_no?.toLowerCase().includes(q)
      );
    }
    setFilteredStudents(filtered);
  };

  const getUniqueClasses = () =>
    [...new Set(allStudents.map(s => s.class_name).filter(Boolean))].sort();

  const getUniqueSections = () => {
    const src = filters.className
      ? allStudents.filter(s => s.class_name === filters.className)
      : allStudents;
    return [...new Set(src.map(s => s.section_name).filter(Boolean))].sort();
  };

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleReset = () => setFilters({ academicYear: '2026-27', className: '', sectionName: '', searchText: '' });
  const handleCollect = (student) => navigate(`/admin/fees-payment/student/${student.student_id}`);

  const avatarColors = [
    { bg: '#FFF3E0', text: '#E65100' },
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#E3F2FD', text: '#1565C0' },
    { bg: '#FCE4EC', text: '#880E4F' },
    { bg: '#EDE7F6', text: '#4527A0' },
    { bg: '#E0F2F1', text: '#00695C' },
  ];
  const getAvatar = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold">Loading Students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">

          {/* ✅ Academic Year - 2026-27 to 2032-33 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Academic Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white"
            >
              {ACADEMIC_YEARS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Class</label>
            <select
              value={filters.className}
              onChange={(e) => { handleFilterChange('className', e.target.value); handleFilterChange('sectionName', ''); }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white"
            >
              <option value="">All Classes</option>
              {getUniqueClasses().map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Section</label>
            <select
              value={filters.sectionName}
              onChange={(e) => handleFilterChange('sectionName', e.target.value)}
              disabled={!filters.className}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Sections</option>
              {getUniqueSections().map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name or Admission ID..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:border-orange-500 bg-white placeholder-gray-400"
              />
              {filters.searchText && (
                <button onClick={() => handleFilterChange('searchText', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {(filters.className || filters.sectionName || filters.searchText) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredStudents.length}</span> of <span className="font-semibold text-gray-900">{allStudents.length}</span> students
            </span>
            <button onClick={handleReset} className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ color: '#EA580C' }}>
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Students Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Recent Fee Transactions</h2>
          
        </div>

        <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {[
            { label: 'Student',      span: 'col-span-5' },
            { label: 'Admission No', span: 'col-span-3' },
            { label: 'Action',       span: 'col-span-2 text-right' },
          ].map(({ label, span }) => (
            <div key={label} className={`text-xs font-bold text-gray-500 uppercase tracking-wider ${span}`}>
              {label}
            </div>
          ))}
        </div>

        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredStudents.map((student) => {
              const av = getAvatar(student.name);
              return (
                <div
                  key={student.student_id}
                  className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-orange-50/30 transition-colors group"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: av.bg, color: av.text }}
                    >
                      {student.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-gray-700 font-medium">{student.admission_no}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleCollect(student)}
                      className="px-4 py-2 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
                      style={{ background: '#EA580C' }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No students found</p>
            <p className="text-gray-400 text-sm mt-1">
              {allStudents.length === 0 ? 'No students in the system' : 'Try adjusting your filters'}
            </p>
            {allStudents.length > 0 && (
              <button
                onClick={handleReset}
                className="mt-4 px-5 py-2 rounded-lg text-white font-semibold text-sm"
                style={{ background: '#EA580C' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {filteredStudents.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing 1 to {Math.min(filteredStudents.length, 10)} of {filteredStudents.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">‹</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-white text-sm font-bold" style={{ background: '#EA580C' }}>1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-500 text-sm transition-colors">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectFee;