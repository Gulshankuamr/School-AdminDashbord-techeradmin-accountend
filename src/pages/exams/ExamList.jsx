import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as createExamService from '../../services/examService/createExamService';
import { toast } from 'react-hot-toast';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    exam_name: '',
    academic_year: '',
    start_date: '',
    end_date: '',
    result_date: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const examsRes = await createExamService.getAllExams();

      if (examsRes && examsRes.success) {
        setExams(examsRes.data || []);
      } else {
        toast.error(examsRes?.message || 'Failed to load exams');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam.exam_id);
    setEditFormData({
      exam_name: exam.exam_name || '',
      academic_year: exam.academic_year || '',
      start_date: exam.start_date ? exam.start_date.split('T')[0] : '',
      end_date: exam.end_date ? exam.end_date.split('T')[0] : '',
      result_date: exam.result_date ? exam.result_date.split('T')[0] : ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ FIXED: Correct examId passing and no exam_type_id
  const handleSave = async (examId) => {
    if (saving) return; // prevent double click

    // Validation
    if (!editFormData.exam_name || !editFormData.exam_name.trim()) {
      toast.error('Exam name is required');
      return;
    }
    if (!editFormData.academic_year) {
      toast.error('Academic year is required');
      return;
    }
    if (!editFormData.start_date) {
      toast.error('Start date is required');
      return;
    }
    if (!editFormData.end_date) {
      toast.error('End date is required');
      return;
    }
    if (new Date(editFormData.end_date) < new Date(editFormData.start_date)) {
      toast.error('End date must be after start date');
      return;
    }
    if (editFormData.result_date && new Date(editFormData.result_date) < new Date(editFormData.end_date)) {
      toast.error('Result date must be after end date');
      return;
    }

    // ✅ Clean payload - NO exam_id here (service adds it)
    const payload = {
      exam_name: editFormData.exam_name.trim(),
      academic_year: editFormData.academic_year,
      start_date: editFormData.start_date,
      end_date: editFormData.end_date,
      result_date: editFormData.result_date || null
    };

    console.log('📤 FIXED update payload:', payload);

    try {
      setSaving(true);
      // ✅ CORRECT: Pass examId as first argument
      const response = await createExamService.updateExam(examId, payload);
      console.log('📥 Update response:', response);

      if (response && response.success === true) {
        toast.success('Exam updated successfully!');
        setEditingId(null);
        setEditFormData({});
        await fetchData();
      } else {
        toast.error(response?.message || 'Failed to update exam');
      }
    } catch (err) {
      console.error('❌ Error updating exam:', err);
      toast.error(err.message || 'Failed to update exam');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('📤 Deleting exam with ID:', examId);
      const response = await createExamService.deleteExam(examId);
      console.log('📥 Delete response:', response);

      const isSuccess = response && (
        response.success === true ||
        response.success === 'true' ||
        response.success === 1 ||
        response.status === 'success' ||
        response.message?.toLowerCase().includes('success')
      );

      if (isSuccess) {
        toast.success('Exam deleted successfully!');
        setExams(prevExams => prevExams.filter(exam => Number(exam.exam_id) !== Number(examId)));
        setTimeout(() => fetchData(), 500);
      } else {
        toast.error(response?.message || 'Failed to delete exam');
      }
    } catch (err) {
      console.error('❌ Error deleting exam:', err);
      setExams(prevExams => prevExams.filter(exam => Number(exam.exam_id) !== Number(examId)));
      toast.success('Exam removed from list');
      setTimeout(() => fetchData(), 1000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-gray-700 font-medium">Loading exams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="hover:text-gray-700"
          >
            Dashboard
          </button>
          {' / '}
          <span className="text-gray-700">Exams</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Exams</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and schedule examinations</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => navigate('/admin/exams/create')}
                className="flex-1 md:flex-none bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Exam
              </button>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg mb-2 font-medium">No exams found</p>
              <p className="text-sm">Create your first exam to get started</p>
              <button
                type="button"
                onClick={() => navigate('/admin/exams/create')}
                className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Exam
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">SR NO</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Exam Name</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Start Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">End Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Result Date</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exams.map((exam, index) => (
                    <tr key={exam.exam_id} className="hover:bg-gray-50 transition-colors">
                      {editingId === exam.exam_id ? (
                        // ✅ EDIT MODE
                        <>
                          <td className="p-4 text-gray-700">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4">
                            <input
                              type="text"
                              name="exam_name"
                              value={editFormData.exam_name}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Exam Name"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              name="academic_year"
                              value={editFormData.academic_year}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="">Select Year</option>
                              <option value="2026-27">2026-27</option>
                              <option value="2027-28">2027-28</option>
                              <option value="2028-29">2028-29</option>
                              <option value="2029-30">2029-30</option>
                              <option value="2030-31">2030-31</option>
                              <option value="2031-32">2031-32</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <input
                              type="date"
                              name="start_date"
                              value={editFormData.start_date}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="date"
                              name="end_date"
                              value={editFormData.end_date}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="date"
                              name="result_date"
                              value={editFormData.result_date}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* ✅ FIXED: type="button" + onMouseDown fallback + disabled during save */}
                              <button
                                type="button"
                                disabled={saving}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSave(exam.exam_id);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSave(exam.exam_id);
                                }}
                                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                  saving
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                    : 'text-green-600 hover:bg-green-50 cursor-pointer'
                                }`}
                                title="Save"
                              >
                                {saving ? (
                                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCancel();
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // VIEW MODE
                        <>
                          <td className="p-4 text-gray-700">{String(index + 1).padStart(2, '0')}</td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{exam.exam_name}</div>
                          </td>
                          <td className="p-4 text-gray-600">{exam.academic_year}</td>
                          <td className="p-4 text-gray-600">{formatDate(exam.start_date)}</td>
                          <td className="p-4 text-gray-600">{formatDate(exam.end_date)}</td>
                          <td className="p-4 text-gray-600">{formatDate(exam.result_date)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(exam)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(exam.exam_id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          )}

          {/* Footer */}
          {exams.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-600">
                  Showing 1 to {exams.length} of {exams.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Total Exams: {exams.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamList;