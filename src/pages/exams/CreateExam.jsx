import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as createExamService from '../../services/examService/createExamService';
import { toast } from 'react-hot-toast';

const ACADEMIC_YEARS = [
  '2026-27', '2027-28', '2028-29', '2029-30', '2030-31', '2031-32'
];

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    exam_name: '',
    term: '',
    weightage_percentage: '',
    academic_year: '2026-27',
    start_date: '',
    end_date: '',
    result_date: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.exam_name.trim()) newErrors.exam_name = 'Exam name is required';
    if (!formData.term) newErrors.term = 'Term is required';
    if (!formData.academic_year) newErrors.academic_year = 'Academic year is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    if (formData.result_date && formData.end_date) {
      if (new Date(formData.result_date) < new Date(formData.end_date)) {
        newErrors.result_date = 'Result date must be after end date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // ✅ Snapshot exact values user selected before any async call
    const rawWeightage = formData.weightage_percentage;
    const parsedWeightage = (rawWeightage !== '' && rawWeightage !== null && rawWeightage !== undefined)
      ? parseFloat(String(rawWeightage))
      : null;

    const payload = {
      exam_name: formData.exam_name.trim(),
      term: formData.term,
      weightage_percentage: parsedWeightage,
      academic_year: formData.academic_year,
      start_date: formData.start_date,
      end_date: formData.end_date,
      result_date: formData.result_date || null,
    };

    console.log('📤 Creating exam | term:', payload.term, '| payload:', payload);

    setLoading(true);
    try {
      const response = await createExamService.createExam(payload);
      console.log('📥 Create response:', response);

      if (response && response.success) {
        toast.success(response.message || 'Exam created successfully!');
        navigate('/admin/exams');
      } else {
        toast.error(response?.message || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error(error.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const fieldCls = (field) =>
    `w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
      errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto mb-4">
        <div className="text-sm text-gray-500">
          <button onClick={() => navigate('/admin')} className="hover:text-gray-700">Dashboard</button>
          {' / '}
          <button onClick={() => navigate('/admin/exams')} className="hover:text-gray-700">Exams</button>
          {' / '}
          <span className="text-gray-700">Create</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
<div className="p-6 border-b border-gray-100 flex items-center justify-between">

  {/* Left Side */}
  <div>
    <h1 className="text-2xl font-bold text-gray-800">Create Exam</h1>
    <p className="text-sm text-gray-500 mt-1">
      Define examination details and schedule
    </p>
  </div>

  {/* Right Side Button */}
  <button
    onClick={() => navigate("/admin/exams")}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
  >
    View Exam List
  </button>

</div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">

              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  EXAM NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="exam_name"
                  placeholder="e.g. Mid Term Examination"
                  value={formData.exam_name}
                  onChange={handleChange}
                  className={fieldCls('exam_name')}
                />
                {errors.exam_name && <p className="mt-1 text-sm text-red-600">{errors.exam_name}</p>}
              </div>

              {/* Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  TERM <span className="text-red-500">*</span>
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className={fieldCls('term')}
                >
                  <option value="">Select Term</option>
                  <option value="term1">Term 1</option>
                  <option value="term2">Term 2</option>
                </select>
                {errors.term && <p className="mt-1 text-sm text-red-600">{errors.term}</p>}
              </div>

              {/* Weightage Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WEIGHTAGE PERCENTAGE <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  name="weightage_percentage"
                  placeholder="e.g. 10.00"
                  value={formData.weightage_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ACADEMIC YEAR <span className="text-red-500">*</span>
                </label>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  className={fieldCls('academic_year')}
                >
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.academic_year && <p className="mt-1 text-sm text-red-600">{errors.academic_year}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  START DATE <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={fieldCls('start_date')}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  END DATE <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={fieldCls('end_date')}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>

              {/* Result Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RESULT DATE <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="date"
                  name="result_date"
                  value={formData.result_date}
                  onChange={handleChange}
                  className={fieldCls('result_date')}
                />
                {errors.result_date && <p className="mt-1 text-sm text-red-600">{errors.result_date}</p>}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/exams')}
                  className="px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : 'Create Exam'}
                </button>
              </div>

            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          <span className="text-red-500">*</span> Required fields
        </div>
      </div>
    </div>
  );
};

export default CreateExam;