import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as svc from '../../services/examService/examTimetableService';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { toast } from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const dayName = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long' });
};

// ─── Fetch School Profile ────────────────────────────────────────────
const fetchSchoolProfile = async () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/schooladmin/getSchoolAdminProfile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success ? data.data : null;
  } catch (_) { return null; }
};

// ─── Delete Modal ────────────────────────────────────────────────────
const DeleteModal = ({ item, onCancel, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Delete Subject</h3>
          <p className="text-xs text-gray-500">This action cannot be undone</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm">
        <p className="font-semibold text-gray-900">{item?.subject_name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{fmt(item?.exam_date)} • {fmtTime(item?.start_time)}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main ────────────────────────────────────────────────────────────
const ViewExamTimetable = () => {
  const navigate = useNavigate();
  const printRef = useRef();

  // Data
  const [allData,       setAllData]       = useState([]);
  const [exams,         setExams]         = useState([]);   // ✅ from getExams API directly
  const [classes,       setClasses]       = useState([]);
  const [sections,      setSections]      = useState([]);
  const [schoolProfile, setSchoolProfile] = useState(null); // ✅ from getSchoolAdminProfile

  // Filters
  const [selExam,    setSelExam]    = useState('');
  const [selClass,   setSelClass]   = useState('');
  const [selSection, setSelSection] = useState('');

  // Display
  const [loadedRows,   setLoadedRows]   = useState(null);
  const [loadedMeta,   setLoadedMeta]   = useState(null);
  const [initLoading,  setInitLoading]  = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Delete
  const [delTarget, setDelTarget] = useState(null);
  const [delLoading,setDelLoading]= useState(false);

  // ── on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // ✅ Fetch exams from getExams, classes, timetable, and school profile in parallel
        const [examRes, clRes, ttRes, profile] = await Promise.all([
          svc.getAllExams(),          // ✅ GET /schooladmin/getExams → exam_id, exam_name
          svc.getAllClasses(),        // GET /schooladmin/getAllClassList
          svc.getExamTimetable(),    // GET /schooladmin/getExamTimetable (all)
          fetchSchoolProfile(),      // GET /schooladmin/getSchoolAdminProfile
        ]);

        // ✅ Set exams directly from getExams API — shows exam_name in dropdown
        if (examRes?.success) setExams(examRes.data || []);

        if (clRes?.success) setClasses(clRes.data || []);

        const raw = ttRes?.success ? (ttRes.data || []) : [];
        setAllData(raw);

        setSchoolProfile(profile);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setInitLoading(false);
      }
    })();
  }, []);

  // ── sections when class changes ─────────────────────────────────────
  useEffect(() => {
    if (!selClass) { setSections([]); setSelSection(''); return; }
    svc.getSectionsByClass(selClass).then(r => {
      if (r?.success) setSections(r.data || []);
    }).catch(() => setSections([]));
  }, [selClass]);

  // ── Load Timetable ──────────────────────────────────────────────────
  const handleLoad = () => {
    if (!selExam)    { toast.error('Please select an Exam');   return; }
    if (!selClass)   { toast.error('Please select a Class');   return; }
    if (!selSection) { toast.error('Please select a Section'); return; }

    setTableLoading(true);
    setTimeout(() => {
      const result = allData
        .filter(r =>
          String(r.exam_id)    === String(selExam)    &&
          String(r.class_id)   === String(selClass)   &&
          String(r.section_id) === String(selSection)
        )
        .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

      // ✅ Find exam name from exams list (loaded from getExams)
      const examObj  = exams.find(e => String(e.exam_id) === String(selExam));
      const classObj = classes.find(c => String(c.class_id) === String(selClass));
      const secObj   = sections.find(s => String(s.section_id) === String(selSection));

      setLoadedRows(result);
      setLoadedMeta({
        exam_name:    examObj?.exam_name    || `Exam #${selExam}`,
        class_name:   classObj?.class_name  || `Class ${selClass}`,
        section_name: secObj?.section_name  || `Section ${selSection}`,
      });
      setTableLoading(false);
    }, 200);
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!delTarget) return;
    setDelLoading(true);
    try {
      const res = await svc.deleteExamTimetable(delTarget.timetable_id);
      if (res?.success) {
        toast.success('Deleted successfully');
        const fresh = await svc.getExamTimetable();
        const raw   = fresh?.success ? (fresh.data || []) : [];
        setAllData(raw);
        const updated = raw
          .filter(r =>
            String(r.exam_id)    === String(selExam)    &&
            String(r.class_id)   === String(selClass)   &&
            String(r.section_id) === String(selSection)
          )
          .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
        setLoadedRows(updated);
      } else {
        toast.error('Failed to delete');
      }
    } catch { toast.error('Failed to delete'); }
    finally { setDelLoading(false); setDelTarget(null); }
  };

  // ── Print ───────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!loadedRows?.length || !loadedMeta) return;
    const { exam_name, class_name, section_name } = loadedMeta;

    // ✅ Use school data from API
    const schoolName    = schoolProfile?.school_name         || 'School Name';
    const schoolAddress = schoolProfile?.school_address      || '';
    const schoolPhone   = schoolProfile?.school_phone_number || '';
    const schoolEmail   = schoolProfile?.school_email        || '';
    const schoolSub     = [schoolAddress, schoolPhone, schoolEmail].filter(Boolean).join(' | ');

    const win = window.open('', '_blank', 'width=1050,height=800');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Exam Timetable – ${exam_name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff}
    .page{max-width:950px;margin:0 auto;padding:36px 44px}
    .hdr{display:flex;align-items:center;gap:18px;border-bottom:3px solid #1e3a8a;padding-bottom:16px;margin-bottom:16px}
    .logo{width:58px;height:58px;background:#1e3a8a;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .logo svg{width:32px;height:32px;fill:#fff}
    .school-name{font-size:19px;font-weight:800;color:#1e3a8a;text-transform:uppercase;letter-spacing:.5px}
    .school-sub{font-size:11px;color:#64748b;margin-top:3px}
    .badge{margin-left:auto;border:1.5px solid #c7d2fe;background:#f0f4ff;border-radius:6px;padding:6px 14px;text-align:center;flex-shrink:0}
    .badge-lbl{font-size:9px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px}
    .badge-val{font-size:10px;color:#64748b;margin-top:2px}
    .title-wrap{text-align:center;margin:14px 0 12px}
    .title{font-size:17px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#1e3a8a}
    .title-sub{font-size:12px;color:#64748b;margin-top:4px}
    .divider{display:flex;align-items:center;gap:10px;margin:10px 0}
    .divider::before,.divider::after{content:'';flex:1;height:1px;background:#cbd5e1}
    .divider span{font-size:11px;color:#94a3b8;font-weight:600;white-space:nowrap}
    .info-strip{display:grid;grid-template-columns:repeat(3,1fr);border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px}
    .info-cell{padding:9px 14px;background:#f8fafc}
    .info-cell:not(:last-child){border-right:1px solid #e2e8f0}
    .info-lbl{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8;margin-bottom:2px}
    .info-val{font-size:13px;font-weight:700;color:#1e293b}
    table{width:100%;border-collapse:collapse;font-size:12px}
    thead tr{background:#1e3a8a}
    th{color:#fff;font-weight:700;padding:10px;text-align:left;font-size:11px;letter-spacing:.3px;border:1px solid #1e40af}
    td{padding:9px 10px;border:1px solid #e2e8f0;color:#334155;vertical-align:top}
    tr:nth-child(even) td{background:#f8fafc}
    .c-sno{text-align:center;width:36px;color:#94a3b8;font-size:11px}
    .c-sub{font-weight:700;color:#1e293b}
    .c-date{white-space:nowrap}
    .c-day{color:#6366f1;font-weight:600;font-size:11px;white-space:nowrap}
    .c-time{white-space:nowrap;font-weight:600;color:#0369a1}
    .c-room{font-weight:600}
    .c-marks{text-align:center;font-weight:700}
    .c-pass{text-align:center;font-weight:700;color:#16a34a}
    .inst-box{margin-top:16px;border:1.5px solid #bfdbfe;border-radius:8px;overflow:hidden}
    .inst-hdr{background:#eff6ff;padding:8px 14px;border-bottom:1px solid #bfdbfe;font-size:12px;font-weight:700;color:#1e3a8a}
    .inst-body{padding:10px 14px;display:grid;grid-template-columns:1fr 1fr;gap:3px 20px}
    .inst-body li{font-size:11px;color:#475569;list-style:none;padding-left:14px;position:relative;line-height:1.6}
    .inst-body li::before{content:'✓';position:absolute;left:0;color:#16a34a;font-weight:700;font-size:10px;top:2px}
    .sig-row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;padding-top:14px;border-top:1px solid #e2e8f0}
    .sig{text-align:center}
    .sig-line{border-top:2px solid #1e3a8a;width:150px;margin-bottom:5px}
    .sig-name{font-size:12px;font-weight:700;color:#1e293b}
    .sig-title{font-size:9.5px;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8}
    .stamp{width:72px;height:72px;border:3px solid #1e3a8a;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:.18;margin:0 auto}
    .stamp-txt{font-size:8px;font-weight:800;color:#1e3a8a;text-align:center;text-transform:uppercase}
    .footer{text-align:center;margin-top:14px;font-size:10px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:10px}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body><div class="page">

  <!-- Header — school from API -->
  <div class="hdr">
    <div class="logo">
      <svg viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg>
    </div>
    <div>
      <div class="school-name">${schoolName}</div>
      ${schoolSub ? `<div class="school-sub">${schoolSub}</div>` : ''}
    </div>
    <div class="badge">
      <div class="badge-lbl">OFFICIAL DOCUMENT</div>
      <div class="badge-val">${new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-wrap">
    <div class="title">EXAMINATION TIMETABLE</div>
    <div class="title-sub">Class: ${class_name} – Section ${section_name}</div>
  </div>
  <div class="divider"><span>${exam_name}</span></div>

  <!-- Info Strip -->
  <div class="info-strip">
    <div class="info-cell">
      <div class="info-lbl">Exam</div>
      <div class="info-val">${exam_name}</div>
    </div>
    <div class="info-cell">
      <div class="info-lbl">Class & Section</div>
      <div class="info-val">${class_name} – ${section_name}</div>
    </div>
    <div class="info-cell">
      <div class="info-lbl">Total Subjects</div>
      <div class="info-val">${loadedRows.length} Subject${loadedRows.length !== 1 ? 's' : ''}</div>
    </div>
  </div>

  <!-- Schedule Table -->
  <table>
    <thead>
      <tr>
        <th>S.No</th><th>Subject</th><th>Date</th><th>Day</th>
        <th>Start Time</th><th>End Time</th><th>Room</th>
        <th style="text-align:center">Max Marks</th>
        <th style="text-align:center">Pass Marks</th>
      </tr>
    </thead>
    <tbody>
      ${loadedRows.map((s, i) => `
        <tr>
          <td class="c-sno">${i + 1}</td>
          <td class="c-sub">${s.subject_name || '—'}</td>
          <td class="c-date">${fmt(s.exam_date)}</td>
          <td class="c-day">${dayName(s.exam_date)}</td>
          <td class="c-time">${fmtTime(s.start_time)}</td>
          <td class="c-time">${fmtTime(s.end_time)}</td>
          <td class="c-room">${s.room_no || '—'}</td>
          <td class="c-marks">${s.max_marks ?? '—'}</td>
          <td class="c-pass">${s.min_passing_marks ?? '—'}</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <!-- Instructions -->
  <div class="inst-box">
    <div class="inst-hdr">📋 IMPORTANT INSTRUCTIONS FOR STUDENTS</div>
    <ul class="inst-body">
      <li>Report 15 minutes before commencement of the exam</li>
      <li>Possession of electronic gadgets is strictly prohibited</li>
      <li>Valid School ID Card & Admit Card must be carried</li>
      <li>No student will be allowed to leave before duration ends</li>
      <li>Write Roll Number and Name clearly on the answer sheet</li>
      <li>Use of unfair means leads to immediate cancellation</li>
    </ul>
  </div>

  <!-- Signatures -->
  <div class="sig-row">
    <div style="font-size:11px;color:#64748b">
      Date: ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
    </div>
    <div class="stamp"><div class="stamp-txt">SCHOOL<br>STAMP</div></div>
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-name">Class Teacher</div>
      <div class="sig-title">Signature</div>
    </div>
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-name">Principal</div>
      <div class="sig-title">Signature</div>
    </div>
  </div>

  <div class="footer">${schoolName}${schoolSub ? ' | ' + schoolSub : ''}</div>
</div></body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 300);
  };

  // ─── select style ────────────────────────────────────────────────
  const sel = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed";

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
              <span>/</span>
              <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/admin/exams')}>Exams</span>
              <span>/</span>
              <span className="text-gray-700">Exam Timetable</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">View Exam Timetable</h1>
            <p className="text-sm text-gray-500 mt-0.5">Select Exam, Class & Section then load timetable.</p>
          </div>
          <button
            onClick={() => navigate('/admin/exams/timetable/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Create New Timetable
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* ── Filter Row ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          {initLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading filters...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

              {/* ✅ EXAM — from getExams, shows exam_name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Exam <span className="text-red-500">*</span>
                </label>
                <select value={selExam} onChange={e => setSelExam(e.target.value)} className={sel}>
                  <option value="">-- Select Exam --</option>
                  {exams.map(e => (
                    <option key={e.exam_id} value={e.exam_id}>
                      {e.exam_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLASS */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Class <span className="text-red-500">*</span>
                </label>
                <select value={selClass} onChange={e => { setSelClass(e.target.value); setSelSection(''); }} className={sel}>
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SECTION */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Section <span className="text-red-500">*</span>
                </label>
                <select value={selSection} onChange={e => setSelSection(e.target.value)} disabled={!selClass} className={sel}>
                  <option value="">-- Select Section --</option>
                  {sections.map(s => (
                    <option key={s.section_id} value={s.section_id}>
                      {s.section_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LOAD button */}
              <div>
                <button
                  onClick={handleLoad}
                  disabled={tableLoading || initLoading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {tableLoading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Loading...</>
                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>Load Timetable</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Not loaded yet ── */}
        {loadedRows === null && !tableLoading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800 text-lg mb-1">Select Filters & Load Timetable</p>
            <p className="text-sm text-gray-400">Choose Exam, Class & Section → Click "Load Timetable"</p>
          </div>
        )}

        {/* ── Loaded ── */}
        {loadedRows !== null && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Subjects',  value: loadedRows.length,                                            color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
                { label: 'Exam Days',       value: new Set(loadedRows.map(r => r.exam_date?.split('T')[0])).size, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
                { label: 'Unique Subjects', value: new Set(loadedRows.map(r => r.subject_id)).size,               color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                { label: 'Max Marks',       value: loadedRows.length ? Math.max(...loadedRows.map(r => r.max_marks || 0)) : 0, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
              ].map(card => (
                <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
                  <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">{loadedMeta?.exam_name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {loadedMeta?.class_name} – Section {loadedMeta?.section_name} &nbsp;•&nbsp; {loadedRows.length} record(s)
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  disabled={!loadedRows.length}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold disabled:opacity-40 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>

              {loadedRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">No records found</p>
                  <p className="text-sm text-gray-400">No timetable scheduled for selected filters</p>
                  <button onClick={() => navigate('/admin/exams/timetable/create')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                    + Create Timetable
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto" ref={printRef}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['#','Subject','Date','Day','Start Time','End Time','Room','Max Marks','Pass Marks','Actions'].map((h, i) => (
                          <th key={i} className={`px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap ${i >= 7 && i <= 8 ? 'text-center' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadedRows.map((row, i) => (
                        <tr key={row.timetable_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{row.subject_name || '—'}</td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmt(row.exam_date)}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-semibold whitespace-nowrap">
                              {dayName(row.exam_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-blue-700 font-medium whitespace-nowrap">{fmtTime(row.start_time)}</td>
                          <td className="px-4 py-3 text-blue-700 font-medium whitespace-nowrap">{fmtTime(row.end_time)}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{row.room_no || '—'}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{row.max_marks ?? '—'}</td>
                          <td className="px-4 py-3 text-center font-bold text-green-700">{row.min_passing_marks ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => navigate(`/admin/exams/timetable/edit/${row.timetable_id}`)}
                                title="Edit"
                                className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDelTarget(row)}
                                title="Delete"
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {delTarget && (
        <DeleteModal
          item={delTarget}
          onCancel={() => setDelTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={delLoading}
        />
      )}
    </div>
  );
};

export default ViewExamTimetable;