import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, Download, Printer, AlertTriangle } from 'lucide-react';
import timetableService from '../../services/timetableService/timetableService';
import { useToast } from '../../components/ui/toast';

// ═══════════════════════════════════════
//  CUSTOM DELETE CONFIRM MODAL
// ═══════════════════════════════════════
const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4 z-10">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Period?</h3>
          <p className="text-gray-500 text-sm">
            This action cannot be undone. The period will be permanently removed.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════
const ViewAllTimetable = () => {
  const printRef = useRef();
  const { ToastContainer, success, error } = useToast();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetableData, setTimetableData] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const [loading, setLoading] = useState({
    initial: false,
    sections: false,
    timetable: false,
    saving: false,
    deleting: null,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        timetableService.getAllClasses(),
        timetableService.getAllSubjects(),
        timetableService.getAllTeachers(),
      ]);
      if (classesRes.success) setClasses(classesRes.data || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (teachersRes.success) setTeachers(teachersRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
      setTimetableData([]);
    }
  }, [selectedClass]);

  const loadSections = async (classId) => {
    try {
      setLoading(prev => ({ ...prev, sections: true }));
      const response = await timetableService.getSectionsByClass(classId);
      if (response.success) setSections(response.data || []);
    } catch (err) {
      console.error('Failed to load sections:', err);
    } finally {
      setLoading(prev => ({ ...prev, sections: false }));
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchTimetable();
    } else {
      setTimetableData([]);
    }
  }, [selectedClass, selectedSection]);

  const fetchTimetable = async () => {
    setLoading(prev => ({ ...prev, timetable: true }));
    try {
      const response = await timetableService.getTimetable(selectedClass, selectedSection);
      if (response.success) {
        setTimetableData(response.data || []);
      } else {
        setTimetableData([]);
        error('Failed to load timetable');
      }
    } catch (err) {
      setTimetableData([]);
      error('Failed to load timetable');
    } finally {
      setLoading(prev => ({ ...prev, timetable: false }));
    }
  };

  const checkEditConflict = async (data) => {
    try {
      const conflictCheck = await timetableService.checkTimetableConflict({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        day_of_week: data.day_of_week,
        start_time: data.start_time + ':00',
        end_time: data.end_time + ':00',
      });
      if (conflictCheck.exists) {
        return {
          hasConflict: true,
          message: `Time slot conflicts with ${conflictCheck.data.subject_name} - ${conflictCheck.data.teacher_name}`,
        };
      }
      return { hasConflict: false, message: '' };
    } catch (err) {
      return { hasConflict: false, message: '' };
    }
  };

  const handleEdit = (period) => {
    setEditingId(period.timetable_id);
    setEditData({
      subject_id: period.subject_id.toString(),
      teacher_id: period.teacher_id.toString(),
      day_of_week: period.day_of_week,
      start_time: period.start_time ? period.start_time.substring(0, 5) : '',
      end_time: period.end_time ? period.end_time.substring(0, 5) : '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (timetableId) => {
    if (!editData.subject_id || !editData.teacher_id || !editData.start_time || !editData.end_time) {
      error('Please fill all fields'); return;
    }
    if (editData.start_time >= editData.end_time) {
      error('End time must be after start time'); return;
    }
    const conflictResult = await checkEditConflict(editData);
    if (conflictResult.hasConflict) { error(conflictResult.message); return; }

    try {
      setLoading(prev => ({ ...prev, saving: true }));
      const updateData = {
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: parseInt(editData.subject_id),
        teacher_id: parseInt(editData.teacher_id),
        day_of_week: editData.day_of_week,
        start_time: editData.start_time + ':00',
        end_time: editData.end_time + ':00',
      };
      const response = await timetableService.updateTimetable(timetableId, updateData);
      if (response.success) {
        setTimetableData(prev =>
          prev.map(period =>
            period.timetable_id === timetableId ? { ...period, ...updateData } : period
          )
        );
        success('Period updated successfully');
        setEditingId(null);
        setEditData({});
      } else {
        error(response.message || 'Failed to update');
      }
    } catch (err) {
      error('Error: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Step 1: click delete — open modal (NO window.confirm)
  const handleDeleteClick = (timetableId) => {
    setDeleteModal({ open: true, id: timetableId });
  };

  // Step 2: Cancel
  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, id: null });
  };

  // Step 3: Confirm — close modal FIRST, then optimistic delete
const handleDeleteConfirm = async () => {
  const timetableId = deleteModal.id;

  setDeleteModal({ open: false, id: null });

  // Optimistic remove
  setTimetableData(prev =>
    prev.filter(p => p.timetable_id !== timetableId)
  );

  try {
    const response = await timetableService.deleteTimetable(timetableId);

    if (response.message === 'Timetable deleted successfully') {
      success('Deleted successfully');

      // ✅ sync with backend (IMPORTANT)
      fetchTimetable();
    } else {
      error('Delete failed');
      fetchTimetable(); // rollback via fresh data
    }

  } catch (err) {
    error('Error deleting');
    fetchTimetable(); // rollback
  }
};

  const handleDownloadCSV = () => {
    if (!timetableData.length) { error('No timetable data to download'); return; }
    const headers = ['Day', 'Start Time', 'End Time', 'Subject', 'Teacher'];
    const rows = timetableData.map(p => [
      p.day_of_week, formatTime(p.start_time), formatTime(p.end_time),
      getSubjectName(p.subject_id), getTeacherName(p.teacher_id),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })));
    link.setAttribute('download', `Timetable_${getClassName(selectedClass)}_${getSectionName(selectedSection)}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Timetable downloaded');
  };

  const handlePrint = () => {
    if (!timetableData.length) { error('No timetable data to print'); return; }
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<html><head><title>Timetable</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;color:#000}h1,h2{text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #000;padding:10px;text-align:left}
      th{background:#f0f0f0;font-weight:bold}tr:nth-child(even){background:#f9f9f9}
      .no-print{display:none}</style></head>
      <body><h1>Timetable</h1><h2>${getClassName(selectedClass)} - ${getSectionName(selectedSection)}</h2>
      ${printRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const getSubjectName = (id) => subjects.find(s => s.subject_id == id)?.subject_name || 'Not assigned';
  const getTeacherName = (id) => teachers.find(t => t.teacher_id == id)?.name || 'Not assigned';
  const getClassName  = (id) => classes.find(c => c.class_id == id)?.class_name || 'Select Class';
  const getSectionName= (id) => sections.find(s => s.section_id == id)?.section_name || 'Select Section';

  const groupedByDay = timetableData.reduce((acc, p) => {
    if (!acc[p.day_of_week]) acc[p.day_of_week] = [];
    acc[p.day_of_week].push(p);
    return acc;
  }, {});
  Object.keys(groupedByDay).forEach(d => groupedByDay[d].sort((a, b) => a.start_time.localeCompare(b.start_time)));

  const totalPeriods    = timetableData.length;
  const daysWithClasses = Object.keys(groupedByDay).length;
  const uniqueSubjects  = new Set(timetableData.map(p => p.subject_id)).size;
  const uniqueTeachers  = new Set(timetableData.map(p => p.teacher_id)).size;
  const isDaySelected   = selectedDay !== '';

  return (
    <div className="p-6">
      <ToastContainer />

      {/* ✅ Custom Modal — replaces window.confirm */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white" disabled={loading.initial}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Section</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white" disabled={!selectedClass || loading.sections}>
              <option value="">Select Section</option>
              {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Day (Optional)</label>
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white" disabled={!selectedClass || !selectedSection}>
              <option value="">All Days</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={fetchTimetable} disabled={!selectedClass || !selectedSection || loading.timetable}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
            {loading.timetable ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Loading...</> : 'Load Timetable'}
          </button>
          <div className="flex gap-2">
            <button onClick={handleDownloadCSV} disabled={!timetableData.length}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2">
              <Download size={16} /> Download CSV
            </button>
            <button onClick={handlePrint} disabled={!timetableData.length}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {timetableData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{totalPeriods}</div>
            <div className="text-blue-800 text-sm">Total Periods</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{daysWithClasses}</div>
            <div className="text-green-800 text-sm">Days</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{uniqueSubjects}</div>
            <div className="text-purple-800 text-sm">Subjects</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{uniqueTeachers}</div>
            <div className="text-orange-800 text-sm">Teachers</div>
          </div>
        </div>
      )}

      {/* Timetable */}
      {loading.timetable ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-black">Loading timetable...</p>
        </div>
      ) : selectedClass && selectedSection && timetableData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div ref={printRef}>
            {!isDaySelected ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-black font-bold">Subject</th>
                      <th className="px-4 py-3 text-left text-black font-bold">Teacher</th>
                      <th className="px-4 py-3 text-left text-black font-bold">Day</th>
                      <th className="px-4 py-3 text-left text-black font-bold">Time</th>
                      <th className="px-4 py-3 text-center text-black font-bold no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData.map((period) => (
                      <tr key={period.timetable_id} className="border-t border-gray-200 hover:bg-gray-50 transition-all duration-150">
                        {editingId === period.timetable_id ? (
                          <>
                            <td className="px-4 py-3">
                              <select value={editData.subject_id} onChange={(e) => setEditData({...editData, subject_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white">
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select value={editData.teacher_id} onChange={(e) => setEditData({...editData, teacher_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white">
                                <option value="">Select Teacher</option>
                                {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.name}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select value={editData.day_of_week} onChange={(e) => setEditData({...editData, day_of_week: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white">
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2 items-center">
                                <input type="time" value={editData.start_time} onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                                  className="px-2 py-1 border border-gray-300 rounded text-black" />
                                <span className="text-black">-</span>
                                <input type="time" value={editData.end_time} onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                                  className="px-2 py-1 border border-gray-300 rounded text-black" />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center no-print">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleSaveEdit(period.timetable_id)} disabled={loading.saving}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-1">
                                  {loading.saving ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />Saving...</> : 'Save'}
                                </button>
                                <button onClick={handleCancelEdit} disabled={loading.saving}
                                  className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium text-black">{getSubjectName(period.subject_id)}</td>
                            <td className="px-4 py-3 text-black">{getTeacherName(period.teacher_id)}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{period.day_of_week}</span>
                            </td>
                            <td className="px-4 py-3 text-black">{formatTime(period.start_time)} - {formatTime(period.end_time)}</td>
                            <td className="px-4 py-3 text-center no-print">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleEdit(period)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit">
                                  <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDeleteClick(period.timetable_id)}
                                  disabled={loading.deleting === period.timetable_id}
                                  className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400" title="Delete">
                                  {loading.deleting === period.timetable_id
                                    ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                                    : <Trash2 size={18} />}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-black">{selectedDay}</h3>
                {groupedByDay[selectedDay]?.length > 0 ? (
                  <div className="space-y-3">
                    {groupedByDay[selectedDay].map((period) => (
                      <div key={period.timetable_id} className="border border-gray-200 rounded-lg p-4">
                        {editingId === period.timetable_id ? (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <select value={editData.subject_id} onChange={(e) => setEditData({...editData, subject_id: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white">
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                              </select>
                              <select value={editData.teacher_id} onChange={(e) => setEditData({...editData, teacher_id: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white">
                                <option value="">Select Teacher</option>
                                {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.name}</option>)}
                              </select>
                            </div>
                            <div className="flex gap-3">
                              <input type="time" value={editData.start_time} onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black" />
                              <input type="time" value={editData.end_time} onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-black" />
                            </div>
                            <div className="flex gap-2 no-print">
                              <button onClick={() => handleSaveEdit(period.timetable_id)} disabled={loading.saving}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2">
                                {loading.saving ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />Saving...</> : 'Save'}
                              </button>
                              <button onClick={handleCancelEdit} disabled={loading.saving}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-lg text-black">{getSubjectName(period.subject_id)}</div>
                              <div className="text-black">{getTeacherName(period.teacher_id)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-black">{formatTime(period.start_time)} - {formatTime(period.end_time)}</div>
                              <div className="flex gap-2 mt-2 no-print">
                                <button onClick={() => handleEdit(period)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Edit</button>
                                <button onClick={() => handleDeleteClick(period.timetable_id)}
                                  disabled={loading.deleting === period.timetable_id}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 flex items-center gap-2">
                                  {loading.deleting === period.timetable_id
                                    ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />Deleting...</>
                                    : 'Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-black">No classes scheduled for {selectedDay}</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : selectedClass && selectedSection ? (
        <div className="text-center py-12 text-black">
          No timetable found for {getClassName(selectedClass)} - {getSectionName(selectedSection)}
        </div>
      ) : (
        <div className="text-center py-12 text-black">
          Please select a class and section to view timetable
        </div>
      )}
    </div>
  );
};

export default ViewAllTimetable;