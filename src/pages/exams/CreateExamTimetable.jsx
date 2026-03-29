import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as svc from '../../services/examService/examTimetableService';
import { toast } from 'react-hot-toast';

// ─── Style constants ────────────────────────────────────────────────
const inputCls  = "w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none";
const selectCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400";
const thCls     = "border border-gray-300 px-3 py-2.5 text-left text-xs font-semibold text-gray-600 bg-gray-100 whitespace-nowrap";
const tdCls     = "border border-gray-300 px-2 py-1.5";

// ─── Empty row factory ───────────────────────────────────────────────
const emptyRow = () => ({
  _key: Date.now() + Math.random(),
  subject_id: '',
  exam_date: '',
  start_time: '09:00',
  end_time: '12:00',
  room_no: '',
  max_marks: 100,
  min_passing_marks: 33,
  instructions: '',
  // edit-state
  saved: false,
  saving: false,
  timetable_id: null,
});

// ─── Component ──────────────────────────────────────────────────────
const CreateExamTimetable = () => {
  const navigate = useNavigate();
  const { id } = useParams();           // timetable_id for edit mode
  const isEdit  = Boolean(id);

  const [initLoading, setInitLoading] = useState(true);
  const [saveAllBusy, setSaveAllBusy] = useState(false);

  // Dropdown data
  const [exams,    setExams]    = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Header selections
  const [selExam,    setSelExam]    = useState('');
  const [selClass,   setSelClass]   = useState('');
  const [selSection, setSelSection] = useState('');

  // Rows
  const [rows, setRows] = useState([]);

  // ── fetch on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [exRes, clRes, subRes] = await Promise.all([
          svc.getAllExams(),
          svc.getAllClasses(),
          svc.getSubjectsByClass(),
        ]);
        if (exRes?.success)  setExams(exRes.data   || []);
        if (clRes?.success)  setClasses(clRes.data  || []);
        if (subRes?.success) setSubjects(subRes.data || []);

        // Edit mode — load existing timetable
        if (isEdit) await loadEditData(parseInt(id), exRes?.data || [], clRes?.data || [], subRes?.data || []);
      } catch (e) {
        toast.error('Failed to load data');
      } finally {
        setInitLoading(false);
      }
    })();
  }, []);

  // ── sections whenever class changes ──────────────────────────────
  useEffect(() => {
    if (!selClass) { setSections([]); setSelSection(''); return; }
    svc.getSectionsByClass(selClass).then(r => {
      if (r?.success) setSections(r.data || []);
    }).catch(() => setSections([]));
  }, [selClass]);

  // ── load edit data ────────────────────────────────────────────────
  const loadEditData = async (timetableId, allExams, allClasses, allSubjects) => {
    const res = await svc.getExamTimetable();
    if (!res?.success) return;
    const all = res.data || [];
    const current = all.find(t => t.timetable_id === timetableId);
    if (!current) return;

    // Group: same exam_id + class_id + section_id
    const related = all.filter(t =>
      t.exam_id    === current.exam_id &&
      t.class_id   === current.class_id &&
      t.section_id === current.section_id
    ).sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

    setSelExam(String(current.exam_id));
    setSelClass(String(current.class_id));

    // Sections will load via useEffect; set section after a tiny delay
    setTimeout(() => setSelSection(String(current.section_id)), 400);

    setRows(related.map(t => ({
      _key: t.timetable_id,
      subject_id: String(t.subject_id || ''),
      exam_date:  t.exam_date?.split('T')[0] || '',
      start_time: t.start_time || '09:00',
      end_time:   t.end_time   || '12:00',
      room_no:    t.room_no    || '',
      max_marks:  t.max_marks  || 100,
      min_passing_marks: t.min_passing_marks || 33,
      instructions: t.instructions || '',
      saved:       true,
      saving:      false,
      timetable_id: t.timetable_id,
    })));
  };

  // ── row helpers ───────────────────────────────────────────────────
  const addRow = () => {
    if (!selExam)    { toast.error('Please select an Exam');    return; }
    if (!selClass)   { toast.error('Please select a Class');    return; }
    if (!selSection) { toast.error('Please select a Section');  return; }
    setRows(r => [...r, emptyRow()]);
  };

  const updateRow = (key, field, val) =>
    setRows(r => r.map(row => row._key === key ? { ...row, [field]: val, saved: false } : row));

  const removeRow = (key) => setRows(r => r.filter(row => row._key !== key));

  // ── validate a single row ─────────────────────────────────────────
  const validateRow = (row, idx) => {
    if (!row.subject_id) { toast.error(`Row ${idx+1}: Select subject`);      return false; }
    if (!row.exam_date)  { toast.error(`Row ${idx+1}: Select exam date`);    return false; }
    if (!row.start_time) { toast.error(`Row ${idx+1}: Enter start time`);    return false; }
    if (!row.end_time)   { toast.error(`Row ${idx+1}: Enter end time`);      return false; }
    if (parseInt(row.min_passing_marks) > parseInt(row.max_marks)) {
      toast.error(`Row ${idx+1}: Pass marks > Max marks`); return false;
    }
    return true;
  };

  // ── build payload ─────────────────────────────────────────────────
  const buildPayload = (row) => ({
    exam_id:           parseInt(selExam),
    class_id:          parseInt(selClass),
    section_id:        parseInt(selSection),
    subject_id:        parseInt(row.subject_id),
    exam_date:         row.exam_date,
    start_time:        row.start_time,
    end_time:          row.end_time,
    room_no:           row.room_no || '',
    max_marks:         parseInt(row.max_marks)         || 100,
    min_passing_marks: parseInt(row.min_passing_marks) || 33,
    instructions:      row.instructions || '',
  });

  // ── save single row ───────────────────────────────────────────────
  const saveRow = async (key, idx) => {
    const row = rows.find(r => r._key === key);
    if (!row || !validateRow(row, idx)) return;

    setRows(r => r.map(x => x._key === key ? { ...x, saving: true } : x));
    try {
      let res;
      if (row.timetable_id) {
        res = await svc.updateExamTimetable({ timetable_id: row.timetable_id, ...buildPayload(row) });
      } else {
        res = await svc.createExamTimetable(buildPayload(row));
      }
      if (res?.success) {
        toast.success('Saved ✓');
        setRows(r => r.map(x => x._key === key ? {
          ...x, saving: false, saved: true,
          timetable_id: res.data?.timetable_id || x.timetable_id,
        } : x));
      } else {
        toast.error(res?.message || 'Failed to save');
        setRows(r => r.map(x => x._key === key ? { ...x, saving: false } : x));
      }
    } catch (e) {
      toast.error('Save failed');
      setRows(r => r.map(x => x._key === key ? { ...x, saving: false } : x));
    }
  };

  // ── save all ──────────────────────────────────────────────────────
  const saveAll = async () => {
    if (!selExam)    { toast.error('Please select an Exam');   return; }
    if (!selClass)   { toast.error('Please select a Class');   return; }
    if (!selSection) { toast.error('Please select a Section'); return; }
    if (rows.length === 0) { toast.error('Add at least one subject'); return; }
    for (let i = 0; i < rows.length; i++) {
      if (!validateRow(rows[i], i)) return;
    }

    setSaveAllBusy(true);
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        let res;
        if (row.timetable_id) {
          res = await svc.updateExamTimetable({ timetable_id: row.timetable_id, ...buildPayload(row) });
        } else {
          res = await svc.createExamTimetable(buildPayload(row));
        }
        if (res?.success) ok++;
        else fail++;
      } catch { fail++; }
    }
    setSaveAllBusy(false);
    if (ok > 0)   toast.success(`${ok} subject(s) saved`);
    if (fail > 0) toast.error(`${fail} subject(s) failed`);
    if (fail === 0 && ok > 0) navigate('/admin/exams/timetable');
  };

  if (initLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit' : 'Create'} Exam Timetable</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in exam details per subject and save.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/exams/timetable')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
              View All List
            </button>
            <button onClick={saveAll} disabled={saveAllBusy}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {saveAllBusy && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saveAllBusy ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>

        {/* ── Step 1: Exam + Class + Section ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h2 className="font-semibold text-gray-800 text-sm">Step 1: Select Exam, Class & Section</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exam */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Exam <span className="text-red-500">*</span>
              </label>
              <select value={selExam} onChange={e => setSelExam(e.target.value)} className={selectCls}>
                <option value="">Select Exam</option>
                {exams.map(ex => (
                  <option key={ex.exam_id} value={ex.exam_id}>{ex.exam_name}</option>
                ))}
              </select>
              {/* {selExam && (
                <p className="text-[10px] text-blue-500 mt-1">
                  exam_id: {selExam} — {exams.find(e => e.exam_id === parseInt(selExam))?.exam_name}
                </p>
              )} */}
            </div>
            {/* Class */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Class <span className="text-red-500">*</span>
              </label>
              <select value={selClass} onChange={e => { setSelClass(e.target.value); setSelSection(''); setRows([]); }} className={selectCls}>
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                ))}
              </select>
            </div>
            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Section <span className="text-red-500">*</span>
              </label>
              <select value={selSection} onChange={e => { setSelSection(e.target.value); setRows([]); }} disabled={!selClass} className={selectCls}>
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Step 2: Subject Schedule Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Step 2: Add Subject Schedule</h2>
            <button
              onClick={addRow}
              disabled={!selExam || !selClass || !selSection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Subject
            </button>
          </div>

          <div className="p-6">
            {rows.length === 0 ? (
              <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium mb-1">No subjects added yet</p>
                <p className="text-gray-400 text-sm">
                  {selExam && selClass && selSection
                    ? 'Click "Add Subject" to start building the timetable'
                    : 'Complete Step 1 first, then add subjects'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className={thCls}>#</th>
                      <th className={thCls}>Subject <span className="text-red-500">*</span></th>
                      <th className={thCls}>Exam Date <span className="text-red-500">*</span></th>
                      <th className={thCls}>Start Time <span className="text-red-500">*</span></th>
                      <th className={thCls}>End Time <span className="text-red-500">*</span></th>
                      <th className={thCls}>Room No</th>
                      <th className={thCls}>Max Marks</th>
                      <th className={thCls}>Pass Marks</th>
                      <th className={thCls}>Instructions</th>
                      <th className={`${thCls} text-center`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row._key} className={row.saved ? 'bg-green-50/40' : 'bg-white hover:bg-gray-50'}>
                        {/* # */}
                        <td className={`${tdCls} text-gray-400 text-xs text-center w-8`}>{idx + 1}</td>

                        {/* Subject */}
                        <td className={`${tdCls} min-w-[140px]`}>
                          <select value={row.subject_id} onChange={e => updateRow(row._key, 'subject_id', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Select</option>
                            {subjects.map(s => (
                              <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Exam Date */}
                        <td className={`${tdCls} min-w-[130px]`}>
                          <input type="date" value={row.exam_date}
                            onChange={e => updateRow(row._key, 'exam_date', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </td>

                        {/* Start Time */}
                        <td className={`${tdCls} min-w-[110px]`}>
                          <input type="time" value={row.start_time}
                            onChange={e => updateRow(row._key, 'start_time', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </td>

                        {/* End Time */}
                        <td className={`${tdCls} min-w-[110px]`}>
                          <input type="time" value={row.end_time}
                            onChange={e => updateRow(row._key, 'end_time', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </td>

                        {/* Room No */}
                        <td className={`${tdCls} min-w-[80px]`}>
                          <input type="text" value={row.room_no} placeholder="A-12"
                            onChange={e => updateRow(row._key, 'room_no', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </td>

                        {/* Max Marks */}
                        <td className={`${tdCls} w-20`}>
                          <input type="number" min="1" value={row.max_marks}
                            onChange={e => updateRow(row._key, 'max_marks', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                        </td>

                        {/* Pass Marks */}
                        <td className={`${tdCls} w-20`}>
                          <input type="number" min="1" value={row.min_passing_marks}
                            onChange={e => updateRow(row._key, 'min_passing_marks', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                        </td>

                        {/* Instructions */}
                        <td className={`${tdCls} min-w-[140px]`}>
                          <input type="text" value={row.instructions} placeholder="Answer all questions"
                            onChange={e => updateRow(row._key, 'instructions', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </td>

                        {/* Actions */}
                        <td className={`${tdCls} text-center min-w-[110px]`}>
                          <div className="flex items-center justify-center gap-1">
                            {/* Save row button */}
                            <button
                              onClick={() => saveRow(row._key, idx)}
                              disabled={row.saving || row.saved}
                              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors
                                ${row.saved
                                  ? 'bg-green-100 text-green-700 cursor-default'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}`}
                            >
                              {row.saving
                                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : row.saved
                                  ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                  : null}
                              {row.saving ? '' : row.saved ? 'Saved' : 'Save'}
                            </button>
                            {/* Re-edit if saved */}
                            {row.saved && (
                              <button
                                onClick={() => setRows(r => r.map(x => x._key === row._key ? { ...x, saved: false } : x))}
                                className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                                title="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {/* Delete row */}
                            <button
                              onClick={() => removeRow(row._key)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add more row */}
                <div className="mt-3 text-center">
                  <button onClick={addRow}
                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 mx-auto py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another Subject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        {rows.length > 0 && (
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => navigate('/admin/exams/timetable')}
              className="px-5 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All List
            </button>
            <button onClick={saveAll} disabled={saveAllBusy}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {saveAllBusy && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saveAllBusy ? 'Saving...' : 'Save All'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExamTimetable;